import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SynthTextTab from './SynthTextTab';
import SynthImagesTab from './SynthImagesTab';

const SynthTab: React.FC = () => {
  return (
    <Tabs defaultValue="text" className="w-full">
      <div className="container mx-auto flex justify-center pt-4">
        <TabsList>
          <TabsTrigger id="synth-text-subtab" value="text">Text</TabsTrigger>
          <TabsTrigger id="synth-images-subtab" value="image">Image</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="text">
        <SynthTextTab />
      </TabsContent>

      <TabsContent value="image">
        <SynthImagesTab />
      </TabsContent>
    </Tabs>
  );
};

export default SynthTab;
