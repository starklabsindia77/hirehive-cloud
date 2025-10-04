import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, ArrowRight, ArrowLeft, Briefcase, Users, Calendar, Zap } from 'lucide-react';

interface OnboardingWalkthroughProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

const steps = [
  {
    title: 'Welcome to HireHive!',
    description: 'Let\'s get you started with a quick tour of the platform',
    icon: CheckCircle2,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          HireHive is your all-in-one recruitment platform. In the next few steps, we'll show you how to:
        </p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <Briefcase className="h-5 w-5 text-primary mt-0.5" />
            <span>Create and manage job postings</span>
          </li>
          <li className="flex items-start gap-2">
            <Users className="h-5 w-5 text-primary mt-0.5" />
            <span>Track candidates through your pipeline</span>
          </li>
          <li className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-primary mt-0.5" />
            <span>Schedule and manage interviews</span>
          </li>
          <li className="flex items-start gap-2">
            <Zap className="h-5 w-5 text-primary mt-0.5" />
            <span>Automate your recruitment workflow</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'Create Your First Job',
    description: 'Post a job opening to start attracting candidates',
    icon: Briefcase,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Navigate to the <strong>Jobs</strong> page and click <strong>"Create Job"</strong>. You can:
        </p>
        <ul className="space-y-2 ml-4 list-disc text-muted-foreground">
          <li>Use AI to generate job descriptions</li>
          <li>Set custom application questions</li>
          <li>Publish to your branded career page</li>
          <li>Share directly with candidates</li>
        </ul>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">💡 Pro Tip:</p>
          <p className="text-sm text-muted-foreground">
            Use our AI-powered job description generator to create compelling listings in seconds!
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Manage Candidates',
    description: 'Track candidates through your hiring pipeline',
    icon: Users,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          On the <strong>Candidates</strong> page, you can:
        </p>
        <ul className="space-y-2 ml-4 list-disc text-muted-foreground">
          <li>View all candidates in a visual pipeline</li>
          <li>Drag and drop to move between stages</li>
          <li>Add notes and ratings</li>
          <li>Filter by skills, experience, and more</li>
          <li>Use AI to score and match candidates</li>
        </ul>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">💡 Pro Tip:</p>
          <p className="text-sm text-muted-foreground">
            Use bulk actions to email multiple candidates at once or move them through stages together.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Schedule Interviews',
    description: 'Coordinate interviews with candidates efficiently',
    icon: Calendar,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          The <strong>Interviews</strong> and <strong>Calendar</strong> pages help you:
        </p>
        <ul className="space-y-2 ml-4 list-disc text-muted-foreground">
          <li>Schedule interviews with candidates</li>
          <li>Send automatic calendar invites</li>
          <li>Track interview feedback</li>
          <li>Coordinate with your team</li>
        </ul>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">💡 Pro Tip:</p>
          <p className="text-sm text-muted-foreground">
            Enable calendar integrations to sync interviews with Google Calendar or Outlook.
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Automate Your Process',
    description: 'Set up workflows to save time',
    icon: Zap,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Visit the <strong>Workflows</strong> page to:
        </p>
        <ul className="space-y-2 ml-4 list-disc text-muted-foreground">
          <li>Create automated email sequences</li>
          <li>Auto-advance candidates based on criteria</li>
          <li>Send rejection emails after time periods</li>
          <li>Integrate with Zapier and Make.com</li>
        </ul>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm font-medium mb-2">💡 Pro Tip:</p>
          <p className="text-sm text-muted-foreground">
            Start with simple workflows like "Send welcome email when candidate applies" and build from there.
          </p>
        </div>
      </div>
    ),
  },
];

export function OnboardingWalkthrough({ open, onOpenChange, onComplete }: OnboardingWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = steps[currentStep];
  const StepIcon = step.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
      onOpenChange(false);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
    onOpenChange(false);
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <StepIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle>{step.title}</DialogTitle>
              <DialogDescription>{step.description}</DialogDescription>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="py-6">
          {step.content}
        </div>

        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
