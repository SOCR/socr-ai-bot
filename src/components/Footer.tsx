
import React from 'react';
import { cn } from '@/lib/utils';

interface FooterProps {
  version: string;
}

const Footer: React.FC<FooterProps> = ({ version }) => {
  return (
    <footer className="mt-12 py-8 border-t dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center mb-2">
              <img 
                src="/lovable-uploads/2ee5da75-de6a-4182-be30-93984b17ea5d.png"
                alt="SOCR Logo"
                className="h-8 w-auto mr-2"
              />
              <h3 className="text-lg font-bold">SOCR Project</h3>
            </div>
            <p className="text-sm dark:text-gray-300">
              The Statistics Online Computational Resource (SOCR) provides portable online aids for
              probability and statistics education, technology based instruction, and statistical computing.
            </p>
            <p className="text-sm mt-2">
              <a href="https://socr.umich.edu" className="text-socr-blue hover:underline dark:text-socr-lightblue" target="_blank" rel="noreferrer">
                Visit SOCR Website
              </a>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2">Contact</h3>
            <p className="text-sm dark:text-gray-300">
              <a href="mailto:statistics@umich.edu" className="text-socr-blue hover:underline dark:text-socr-lightblue">
                statistics@umich.edu
              </a>
            </p>
            <p className="text-sm mt-2">
              <a 
                href="http://www.socr.umich.edu/html/SOCR_Contact.html" 
                className="text-socr-blue hover:underline dark:text-socr-lightblue"
                target="_blank"
                rel="noreferrer"
              >
                SOCR Contact
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>AI Bot Version {version}</p>
          <p className="mt-2">
            © {new Date().getFullYear()} Statistics Online Computational Resource (SOCR)
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
