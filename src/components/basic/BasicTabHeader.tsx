
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Accordion from '../Accordion';
import AccordionItem from '../AccordionItem';

const BasicTabHeader: React.FC = () => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardContent className="p-6">
        <div className="flex flex-col items-center space-y-4 py-6">
          <img 
            src="/lovable-uploads/2ee5da75-de6a-4182-be30-93984b17ea5d.png" 
            alt="SOCR Logo" 
            className="h-24 w-auto"
          />
          <div className="text-center space-y-2 max-w-2xl">
            <h3 className="text-xl font-semibold dark:text-white">Welcome to SOCR AI Bot</h3>
            <p className="dark:text-gray-300">
              SOCR AI Bot provides a helpful human-machine interface. It utilizes SOCR and various 
              generative-AI models trained on billions of pieces of information, thousands of books, 
              millions of code repositories, and innumerable web pages, written in dozens of languages. 
              English is the default language, but other languages may also work.
            </p>
          </div>
          
          <Accordion id="Instructions">
            <AccordionItem title="Instructions" status="danger">
              <ul className="list-disc pl-5 space-y-2 dark:text-gray-300">
                <li>Try simple experiments first before gradually adding complexity, specifying alternative plots, or choosing different models.</li>
                <li>AI Bot is a prototype release expanding OpenAI API, RTutor, SOCRAT, and other resources. It's intended for simple and quick demonstrations, not heavy research, complicated studies, or high-throughput analytics.</li>
                <li>When using generative-AI functionality (e.g., to synthetically generate text, images or software code), you have to use your own personal OpenAI unique key.</li>
                <li>Experiment with parameter settings, e.g., increasing the "Temperature" setting may drive more aggressive AI predictions.</li>
                <li>Preprocess and prep the test data prior to loading it in the AI Bot. You can use <a href="https://socr.umich.edu/HTML5/SOCRAT/" className="text-socr-blue hover:underline dark:text-socr-lightblue">SOCRAT's data wrangling functionality</a> for preprocessing.</li>
                <li>An example dataset for testing data uploading is available <a href="https://socr.umich.edu/docs/uploads/2023/SOCR_Dataset_Gapminder.csv" className="text-socr-blue hover:underline dark:text-socr-lightblue">here</a>.</li>
                <li>Confirm proper data type specifications: numeric columns and categories (factors or characters).</li>
                <li>Each chunk of code is run independently using the selected/uploaded data. If you want to build upon the current code, select the "Continue from this chunk" checkbox.</li>
              </ul>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default BasicTabHeader;
