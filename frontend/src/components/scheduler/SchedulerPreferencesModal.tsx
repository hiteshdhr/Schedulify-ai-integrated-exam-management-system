import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react'; // --- FIX: Import loader icon ---

// --- FIX: Define types for live data props ---
interface UserPreferences {
  studyLength: number;
  breakLength: number;
  preferredTime: string;
}

interface SchedulerPreferencesModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: UserPreferences; // Live data from context
  onSave: (newPrefs: UserPreferences) => Promise<void>; // Function to save data
  isSaving: boolean; // Loading state
}
// --- END OF FIX ---

export const SchedulerPreferencesModal: React.FC<SchedulerPreferencesModalProps> = ({ 
  isOpen, 
  onOpenChange, 
  preferences, 
  onSave,
  isSaving
}) => {
  
  // --- FIX: Internal state to manage the form while editing ---
  const [studyLength, setStudyLength] = useState(60);
  const [breakLength, setBreakLength] = useState(10);
  const [preferredTime, setPreferredTime] = useState('any');

  // --- FIX: Sync internal state with live data when modal opens ---
  useEffect(() => {
    if (isOpen && preferences) {
      setStudyLength(preferences.studyLength);
      setBreakLength(preferences.breakLength);
      setPreferredTime(preferences.preferredTime);
    }
  }, [isOpen, preferences]);
  // --- END OF FIX ---

  const handleSave = async () => {
    // Call the onSave function passed from the parent
    await onSave({ studyLength, breakLength, preferredTime });
    onOpenChange(false); // Close modal
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Scheduler Preferences</DialogTitle>
          <DialogDescription>
            Set your default preferences for the smart scheduler.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="studyLength">Default study length (minutes)</Label>
            <div className="flex items-center space-x-4">
              {/* --- FIX: Use internal state for value/onChange --- */}
              <Slider
                id="studyLength"
                min={30}
                max={120}
                step={15}
                value={[studyLength]}
                onValueChange={(val) => setStudyLength(val[0])}
                className="flex-1"
                disabled={isSaving}
              />
              <span className="w-12 text-center font-medium text-muted-foreground">{studyLength}m</span>
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="breakLength">Default break length (minutes)</Label>
            <div className="flex items-center space-x-4">
              <Slider
                id="breakLength"
                min={5}
                max={30}
                step={5}
                value={[breakLength]}
                onValueChange={(val) => setBreakLength(val[0])}
                className="flex-1"
                disabled={isSaving}
              />
              <span className="w-12 text-center font-medium text-muted-foreground">{breakLength}m</span>
            </div>
          </div>
          <div className="space-y-3">
            <Label>Preferred study time</Label>
            <RadioGroup
              value={preferredTime}
              onValueChange={setPreferredTime}
              className="space-y-1"
              disabled={isSaving}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="morning" id="morning" />
                <Label htmlFor="morning">Morning (8am - 12pm)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="afternoon" id="afternoon" />
                <Label htmlFor="afternoon">Afternoon (1pm - 5pm)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="evening" id="evening" />
                <Label htmlFor="evening">Evening (6pm - 10pm)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="any" />
                <Label htmlFor="any">No Preference</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={isSaving}>Cancel</Button>
          </DialogClose>
          {/* --- FIX: Show loading state on save button --- */}
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};