
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

const FeedbackForm: React.FC = () => {
  const { toast } = useToast();
  const [feedback, setFeedback] = useState('');
  const [helpfulness, setHelpfulness] = useState('');
  const [experience, setExperience] = useState('');

  const handleSubmit = () => {
    // In a real implementation, this would send the feedback to a server
    console.log({
      feedback,
      helpfulness,
      experience
    });
    
    toast({
      title: "Feedback submitted",
      description: "Thank you for your feedback!"
    });
    
    // Reset the form
    setFeedback('');
    setHelpfulness('');
    setExperience('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Feedback</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="user-feedback">Your feedback</Label>
          <Textarea
            id="user-feedback"
            placeholder="Any questions? Suggestions? Things you like, don't like? Leave your email if you want to hear back from us."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <Label>How useful is AI Bot?</Label>
          <RadioGroup value={helpfulness} onValueChange={setHelpfulness}>
            {["Not at all", "Slightly", "Helpful", "Extremely"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`helpfulness-${option}`} />
                <Label htmlFor={`helpfulness-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <div className="space-y-2">
          <Label>Your experience with R:</Label>
          <RadioGroup value={experience} onValueChange={setExperience}>
            {["None", "Beginner", "Intermediate", "Advanced"].map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`experience-${option}`} />
                <Label htmlFor={`experience-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={!feedback && !helpfulness && !experience}>
          Save Feedback
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FeedbackForm;
