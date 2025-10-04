import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import { Candidate } from '@/hooks/useCandidates';
import { Job } from '@/hooks/useJobs';
import { Application } from '@/hooks/useApplications';

interface ExportReportDialogProps {
  candidates: Candidate[];
  jobs: Job[];
  applications: Application[];
}

export function ExportReportDialog({ candidates, jobs, applications }: ExportReportDialogProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [reportType, setReportType] = useState<'candidates' | 'jobs' | 'applications' | 'full'>('full');
  const { toast } = useToast();

  const convertToCSV = (data: any[], headers: string[]) => {
    const csvRows = [];
    csvRows.push(headers.join(','));

    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }
        return `"${value || ''}"`;
      });
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  };

  const handleExport = () => {
    let dataToExport: any;
    let filename = '';

    switch (reportType) {
      case 'candidates':
        dataToExport = candidates;
        filename = 'candidates_report';
        break;
      case 'jobs':
        dataToExport = jobs;
        filename = 'jobs_report';
        break;
      case 'applications':
        const enrichedApps = applications.map(app => {
          const candidate = candidates.find(c => c.id === app.candidate_id);
          const job = jobs.find(j => j.id === app.job_id);
          return {
            ...app,
            candidate_name: candidate?.full_name || 'Unknown',
            candidate_email: candidate?.email || '',
            job_title: job?.title || 'Unknown',
            job_department: job?.department || ''
          };
        });
        dataToExport = enrichedApps;
        filename = 'applications_report';
        break;
      case 'full':
        dataToExport = {
          candidates,
          jobs,
          applications: applications.map(app => {
            const candidate = candidates.find(c => c.id === app.candidate_id);
            const job = jobs.find(j => j.id === app.job_id);
            return {
              ...app,
              candidate_name: candidate?.full_name,
              job_title: job?.title
            };
          }),
          summary: {
            total_candidates: candidates.length,
            total_jobs: jobs.length,
            total_applications: applications.length,
            active_jobs: jobs.filter(j => j.status === 'open').length,
            hired_count: applications.filter(a => a.stage === 'hired').length
          }
        };
        filename = 'full_report';
        break;
    }

    let content: string;
    let mimeType: string;

    if (format === 'csv' && Array.isArray(dataToExport)) {
      const headers = Object.keys(dataToExport[0] || {});
      content = convertToCSV(dataToExport, headers);
      mimeType = 'text/csv';
      filename += '.csv';
    } else {
      content = JSON.stringify(dataToExport, null, 2);
      mimeType = 'application/json';
      filename += '.json';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Success',
      description: 'Report exported successfully',
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Report Type</Label>
            <RadioGroup value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="candidates" id="candidates" />
                <Label htmlFor="candidates" className="cursor-pointer">Candidates Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jobs" id="jobs" />
                <Label htmlFor="jobs" className="cursor-pointer">Jobs Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="applications" id="applications" />
                <Label htmlFor="applications" className="cursor-pointer">Applications Only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="cursor-pointer">Full Report (All Data)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" disabled={reportType === 'full'} />
                <Label htmlFor="csv" className="cursor-pointer flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV (Spreadsheet)
                  {reportType === 'full' && <span className="text-xs text-muted-foreground">(Not available for full report)</span>}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="cursor-pointer flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  JSON (Structured Data)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleExport} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
