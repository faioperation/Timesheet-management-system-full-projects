<?php

namespace App\Mail;

use App\Models\EmailTemplate;
use App\Models\Timesheet;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TimesheetApprovalEmail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $timesheet;
    public $template;
    public $processedBody;
    public $processedSubject;

    /**
     * Create a new message instance.
     */
    public function __construct(Timesheet $timesheet, EmailTemplate $template)
    {
        $this->timesheet = $timesheet;
        $this->template = $template;
        $this->processTemplate();
    }

    /**
     * Process the template placeholders.
     */
    protected function processTemplate()
    {
        // Calculate hours breakdown from entries
        $dailyHours = $this->timesheet->entries->sum('daily_hours');
        $extraHours = $this->timesheet->entries->sum('extra_hours');
        $vacationHours = $this->timesheet->entries->sum('vacation_hours');
        
        // Get user details for commission information
        $userDetail = $this->timesheet->userDetail;
        
        // Build timesheet table
        $tableRows = [];
        $tableRows[] = sprintf(
            "%-15s | %12s | %12s | %15s | %12s",
            "Date",
            "Daily Hours",
            "Extra Hours",
            "Vacation Hours",
            "Total"
        );
        $tableRows[] = str_repeat('-', 75);
        
        foreach ($this->timesheet->entries as $entry) {
            $entryTotal = $entry->daily_hours + $entry->extra_hours + $entry->vacation_hours;
            $tableRows[] = sprintf(
                "%-15s | %12.2f | %12.2f | %15.2f | %12.2f",
                $entry->entry_date,
                $entry->daily_hours,
                $entry->extra_hours,
                $entry->vacation_hours,
                $entryTotal
            );
        }
        
        $tableRows[] = str_repeat('-', 75);
        $tableRows[] = sprintf(
            "%-15s | %12.2f | %12.2f | %15.2f | %12.2f",
            "TOTALS",
            $dailyHours,
            $extraHours,
            $vacationHours,
            $this->timesheet->total_hours
        );
        
        $timesheetTable = implode("\n", $tableRows);
        
        // Calculate financial metrics
        $clientRate = $userDetail ? $userDetail->client_rate : 0;
        $payRate = 0;
        
        if ($userDetail) {
            // Calculate pay rate based on W2 or C2C
            if ($userDetail->w2 > 0) {
                $payRate = $userDetail->w2 + ($userDetail->w2 * $userDetail->ptax / 100);
            } else {
                $payRate = $userDetail->c2c_or_other;
            }
        }
        
        $totalBillAmount = $this->timesheet->total_hours * $clientRate;
        $totalPayAmount = $this->timesheet->total_hours * $payRate;
        $netMarginPercentage = $totalBillAmount > 0 
            ? (($this->timesheet->net_margin / $totalBillAmount) * 100) 
            : 0;
        
        $data = [
            // Basic Info
            '{user_name}'        => $this->timesheet->user->name ?? 'User',
            '{timesheet_period}' => ($this->timesheet->start_date ?? '') . ' to ' . ($this->timesheet->end_date ?? ''),
            '{start_date}'       => $this->timesheet->start_date ?? '',
            '{end_date}'         => $this->timesheet->end_date ?? '',
            '{status}'           => ucfirst($this->timesheet->status ?? 'approved'),
            '{remarks}'          => $this->timesheet->remarks ?? 'N/A',
            '{client_name}'      => $this->timesheet->client->name ?? 'N/A',
            
            // Timesheet Table
            '{timesheet_table}'  => $timesheetTable,
            
            // Hours Breakdown
            '{total_hours}'      => number_format($this->timesheet->total_hours ?? 0, 2),
            '{daily_hours}'      => number_format($dailyHours, 2),
            '{extra_hours}'      => number_format($extraHours, 2),
            '{vacation_hours}'   => number_format($vacationHours, 2),
            
            // Financial Information
            '{total_bill_amount}' => number_format($totalBillAmount, 2),
            '{total_pay_amount}'  => number_format($totalPayAmount, 2),
            '{gross_margin}'     => number_format($this->timesheet->gross_margin ?? 0, 2),
            '{expanse}'          => number_format($this->timesheet->expanse ?? 0, 2),
            '{net_margin}'       => number_format($netMarginPercentage, 2),
            '{internal_expanse}' => number_format($this->timesheet->internal_expanse ?? 0, 2),
            
            // Rates (from user details)
            '{client_rate}'      => $userDetail ? number_format($userDetail->client_rate ?? 0, 2) : '0.00',
            '{consultant_rate}'  => $userDetail ? number_format($userDetail->consultant_rate ?? 0, 2) : '0.00',
            '{w2_rate}'          => $userDetail ? number_format($userDetail->w2 ?? 0, 2) : '0.00',
            '{c2c_rate}'         => $userDetail ? number_format($userDetail->c2c_or_other ?? 0, 2) : '0.00',
            '{ptax}'             => $userDetail ? number_format($userDetail->ptax ?? 0, 2) : '0.00',
            
            // Commission Information
            '{am_commission}'    => $userDetail ? number_format($userDetail->account_manager_commission ?? 0, 2) : '0.00',
            '{bdm_commission}'   => $userDetail ? number_format($userDetail->business_development_manager_commission ?? 0, 2) : '0.00',
            '{recruiter_commission}' => $userDetail ? number_format($userDetail->recruiter_commission ?? 0, 2) : '0.00',
            
            // Commission Person Names
            '{account_manager}'  => $userDetail && $userDetail->accountManager ? $userDetail->accountManager->name : 'N/A',
            '{bdm}'              => $userDetail && $userDetail->businessDevelopmentManager ? $userDetail->businessDevelopmentManager->name : 'N/A',
            '{recruiter}'        => $userDetail && $userDetail->recruiter ? $userDetail->recruiter->name : 'N/A',
        ];

        $this->processedBody = str_replace(array_keys($data), array_values($data), $this->template->body);
        $this->processedSubject = str_replace(array_keys($data), array_values($data), $this->template->subject);
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->processedSubject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.dynamic_template',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        $attachments = [];
        
        // Get all attachments for this timesheet
        foreach ($this->timesheet->attachments as $attachment) {
            // Check if file exists in storage
            if (\Storage::disk('public')->exists($attachment->file_path)) {
                $attachments[] = Attachment::fromStorageDisk('public', $attachment->file_path)
                    ->as($attachment->original_filename)
                    ->withMime($attachment->file_type);
            }
        }
        
        return $attachments;
    }
}
