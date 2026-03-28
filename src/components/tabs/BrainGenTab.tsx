
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { generateBrainImage } from '@/lib/braingen';
import {useState} from 'react';



const BrainGenTab: React.FC = () => {
  const [user_id, setUserId] = useState('');
  const [project_id, setProjectId] = useState('');
  const [model_name, setModel] = useState('');
  const [n_images, setNImages] = useState(1);
  const [tumor, setTumor] = useState("With Tumor");
  const [slice_orientation, setSliceOrientation] = useState('Axial');
  const [slice_location, setSliceLocation] = useState('Middle');
  const [loading, setLoading] = useState(false);
  const handleGoToApp = () => {
    window.open('https://socr.umich.edu/HTML5/BrainGen/', '_blank');
  };
const handleGenerateBrainImage = async () => {
  try{
    setLoading(true);

    const data = await generateBrainImage({
      user_id, 
      project_id, 
      model_name, 
      n_images, 
      params: {
        tumor, 
        slice_orientation, 
        slice_location}});
    console.log(data);
  }
  catch(error){
    console.error("Error generating brain image:", error);
  }
  finally{
    setLoading(false);
  }
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
              
                <div className="flex flex-col items-center space-y-4 w-full">
                <div className="w-full max-w-md space-y-3">
                  <input
                    className="w-full border p-2 rounded"
                    type="text"
                    placeholder="User ID"
                    value={user_id}
                    onChange={(e) => setUserId(e.target.value)}
                  />
                  <input
                    className="w-full border p-2 rounded"
                    type="text"
                    placeholder="Project ID"
                    value={project_id}
                    onChange={(e) => setProjectId(e.target.value)}
                  />
                  <input
                    className="w-full border p-2 rounded"
                    type="text"
                    placeholder="Model Name"
                    value={model_name}
                    onChange={(e) => setModel(e.target.value)}
                  />
                  <input
                    className="w-full border p-2 rounded"
                    type="number"
                    value={n_images}
                    onChange={(e) => setNImages(Number(e.target.value))}
                  />
                  <input
                    className="w-full border p-2 rounded"
                    type="text"
                    value={tumor}
                    onChange={(e) => setTumor(e.target.value)}
                  />
                  <input
                    className="w-full border p-2 rounded"
                    type="text"
                    value={slice_orientation}
                    onChange={(e) => setSliceOrientation(e.target.value)}
                  />
                  <input
                    className="w-full border p-2 rounded"
                    type="text"
                    value={slice_location}
                    onChange={(e) => setSliceLocation(e.target.value)}
                  />
                </div>
              </div>
                <div className="flex justify-center mt-8">
                <Button 
                  onClick={handleGenerateBrainImage} 
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
