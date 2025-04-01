
import React from 'react';

interface FooterProps {
  version: string;
}

const Footer: React.FC<FooterProps> = ({ version }) => {
  return (
    <footer className="mt-12 py-8 border-t">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-bold mb-2">SOCR Project</h3>
            <p className="text-sm">
              The Statistics Online Computational Resource (SOCR) provides portable online aids for
              probability and statistics education, technology based instruction, and statistical computing.
            </p>
            <p className="text-sm mt-2">
              <a href="https://socr.umich.edu" className="text-socr-blue hover:underline" target="_blank" rel="noreferrer">
                Visit SOCR Website
              </a>
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-2">Contact</h3>
            <p className="text-sm">
              <a href="mailto:statistics@umich.edu" className="text-socr-blue hover:underline">
                statistics@umich.edu
              </a>
            </p>
            <p className="text-sm mt-2">
              <a 
                href="http://www.socr.umich.edu/html/SOCR_Contact.html" 
                className="text-socr-blue hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                SOCR Contact
              </a>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
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
