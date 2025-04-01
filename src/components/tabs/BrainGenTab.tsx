
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const BrainGenTab: React.FC = () => {
  const handleGoToApp = () => {
    window.open('https://socr.umich.edu/HTML5/BrainGen/', '_blank');
  };

  return (
    <div className="container mx-auto py-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Synthetic Brain Data Generator</CardTitle>
            <CardDescription>Generate realistic synthetic brain imaging data for research and model development</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="flex justify-center">
              <img 
                src="https://mdn.github.io/dom-examples/canvas/pixel-manipulation/bicycle.png" 
                alt="Brain Generator Preview"
                className="max-w-full h-auto rounded-lg shadow-lg" 
              />
            </div>
            
            <div className="prose max-w-none">
              <p>
                The Synthetic Brain Generator is an innovative tool that leverages custom in-house models 
                to produce realistic synthetic imaging data, including intricate 3D brain volumes
                and high-resolution 2D MRI slices. Designed for the development of predictive models 
                such as tumor detection, this platform provides researchers with a unique resource to 
                generate synthetic training data.
              </p>
              
              <p>
                It allows users to generate a variety of image types by adjusting different parameters, 
                ensuring a diverse dataset that reflects a wide range of anatomical features and conditions. 
                This versatility enhances the research process, facilitating more effective model development 
                while minimizing reliance on real patient data.
              </p>
              
              <div className="flex justify-center mt-8">
                <Button 
                  onClick={handleGoToApp} 
                  className="bg-socr-blue hover:bg-socr-darkblue"
                  size="lg"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Go to SOCR BrainGen App
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrainGenTab;
