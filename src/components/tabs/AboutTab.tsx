
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Accordion from '../Accordion';
import AccordionItem from '../AccordionItem';

interface AboutTabProps {
  version: string;
}

const AboutTab: React.FC<AboutTabProps> = ({ version }) => {
  return (
    <div className="container mx-auto py-6">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">About SOCR AI Bot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The SOCR AI Bot uses existing <a href="https://dspa2.predictive.space/" className="text-socr-blue hover:underline" target="_blank" rel="noreferrer">SOCR/DSPA computational libraries</a> and 
            Generative artificial intelligence (gen-AI) interfaces, such as <a href="https://openai.com/" className="text-socr-blue hover:underline" target="_blank" rel="noreferrer">OpenAI's</a> powerful 
            GPT-4 language model, to translate natural language (human text/audio commands) to 
            synthetically generate R code, draft text, simulate 2D images, as well as, model, visualize, and analyze data.
          </p>
          
          <p>
            You can request specific types of data analysis, or use thematic text prompts to generate synthetic images or text.
            Upload a data file (CSV, TSV/tab-delimited text files, and Excel) and just analyze it using plain human commands.
            The results can be quickly downloaded as Rmd source-code or HTML reports.
          </p>
          
          <p className="font-medium">
            The first three tabs of the AI Bot (synthetic text, code, and image generation)
            require users to input their private KEYs (in "SETTINGS") for external generative AI model (GAIM)
            services, such as OpenAI, PaLM, etc. Without importing their private keys
            these functions will not work, although the remaining SOCR AI Bot functions
            will be fully operational even without AI service keys.
          </p>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <p>
              The AI Bot comes with absolutely NO WARRANTY! Some scripts may yield incorrect results.
              Please use the auto-generated code as a starting point for further refinement and validation.
              The SOCR website and the source code (extending DSPA, OpenAI API, RTutor, and other CRAN libraries) 
              is CC BY-NC 3.0 licensed and freely available for academic and non-profit organizations only. 
              For commercial use beyond testing please contact <a href="mailto:statistics@umich.edu?Subject=SOCR AI Bot" className="text-socr-blue hover:underline">statistics@umich.edu</a>.
            </p>
          </div>
          
          <hr />
          
          <p>
            The SOCR IA Bot project is developed by the <a href="https://socr.umich.edu/people/" className="text-socr-blue hover:underline" target="_blank" rel="noreferrer">SOCR Team</a> using 
            existing open-science community-supported resources. All user feedback is valuable, please contact us via 
            <a href="http://www.socr.umich.edu/html/SOCR_Contact.html" className="text-socr-blue hover:underline ml-1" target="_blank" rel="noreferrer">SOCR Contact</a>.
            The AI Bot source code is available at <a href="https://github.com/SOCR" className="text-socr-blue hover:underline" target="_blank" rel="noreferrer">GitHub</a>,
            <a href="https://github.com/gexijin/RTutor" className="text-socr-blue hover:underline ml-1" target="_blank" rel="noreferrer">RTutor</a> and 
            <a href="https://cran.r-project.org/" className="text-socr-blue hover:underline ml-1" target="_blank" rel="noreferrer">CRAN</a>.
          </p>
        </CardContent>
      </Card>
      
      <Accordion id="Frequently_Asked_Questions">
        <AccordionItem title="Frequently Asked Questions" status="danger">
          <ul className="space-y-4">
            <li>
              <strong>What is the <a href="https://rcompute.nursing.umich.edu/SOCR_AI_Bot/" className="text-socr-blue hover:underline" target="_blank" rel="noreferrer">SOCR AI Bot</a>?</strong>
              <p className="mt-1 pl-4">
                An artificial intelligence (AI)-based web application facilitating 
                human-machine interactions, data-interrogation, modeling and analytics.
                Following a data upload or selection (or preloaded sets), users can ask
                questions about or analyze the data with text commands. 
                The app generates and runs R code to answer research questions 
                using exploratory (graphical) or analytical (quantitative) reports.
              </p>
            </li>
            
            <li>
              <strong>How does AI Bot work?</strong>
              <p className="mt-1 pl-4">
                User requests are sent to a server, and OpenAI's AI service.
                The returned objects include draft R code, text, images, and data that is
                cleaned up and manipulated within the app, along with appropriate messages.
                Multiple requests are logged to produce (on-demand) an R Markdown file, which can be
                knitted into an HTML report. This enables record keeping, scientific
                reproducibility, and independent validation.
              </p>
            </li>

            <li>
              <strong>Can people without R coding experience use AI Bot for data analysis?</strong>
              <p className="mt-1 pl-4">
                Some prior coding experience may be useful as AI-generated code may be incomplete. 
                AI Bot may be used for quick EDA.
              </p>
            </li>
            
            <li>
              <strong>Who is this App for?</strong>
              <p className="mt-1 pl-4">
                The primary goal is to help people with some R experience to learn
                R or be more productive. AI Bot can be used to quickly speed up the
                coding process using R. It gives you a draft code to test and
                refine. Be wary of bugs and errors.
              </p>
            </li>
          </ul>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-6">
        <Accordion id="Update_log">
          <AccordionItem title="Update log" status="danger">
            <ul className="space-y-1 list-disc pl-5">
              <li>V3.0 5/6/2025 - Refactored frontend & backend pipeline</li>
              <li>V2.6.2 3/18/2025 - Fixed and added new ChatGPT & Gemini models</li>
              <li>V2.6 10/15/2024 - Integrated Synthetic Brain Data Generator application</li>
              <li>V2.5.2 9/27/2024 - Fixed DALLE image generation and plot generation</li>
              <li>V2.5.1 9/23/2024 - Fixed GPT models and added GPT-4o model in ask tab, changed API key max length</li>
              <li>V2.5 5/22/2024 - Fixed datasets, organized frontend & backend structure</li>
              <li>V2.4 4/28/2024 - Updated UI/UX, integrated Google Gemini its related contents</li>
              <li>V2.3 3/13/2024 - Updated API invocation syntax to adopt the latest OpenAI interface</li>
              <li>V2.0 7/05/2023 - Updated UI, fixed model reference problems, updated content and appearance</li>
              <li>V1.5 2/23/2023 - Updated UX, disabled voice commands, paired down on expensive models</li>
              <li>V1.4 1/26/2023 - Additional features</li>
              <li>V1.3 1/23/2023 - Correction of typos and inconsistencies</li>
              <li>V1.2 1/23/2023 - Enhancements</li>
              <li>V1.1 1/22/2023 - Initial deployment</li>
            </ul>
          </AccordionItem>
        </Accordion>
      </div>
      
      <div className="mt-6">
        <p className="text-center text-sm text-gray-500">SOCR AI Bot Version {version}</p>
      </div>
    </div>
  );
};

export default AboutTab;
