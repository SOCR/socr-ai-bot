// Demo datasets for the application
export const demoDatasets = [
  { value: 'attitude', label: 'Attitude Survey' },
  { value: 'iris', label: 'Iris Flower Data' },
  { value: 'mtcars', label: 'Motor Trend Cars' },
  { value: 'diamonds', label: 'Diamonds (ggplot2)' },
  { value: 'ability.cov', label: 'Ability Covariance Matrix' },
  { value: 'Orange', label: 'Orange Trees Growth' },
  { value: 'USArrests', label: 'US Arrests by State' },
  { value: 'airquality', label: 'New York Air Quality' },
  { value: 'faithful', label: 'Old Faithful Geyser' },
  { value: 'ChickWeight', label: 'Chick Weights' },
];

// Demo prompts for synthetic text generation
export const demoSynthPrompts = [
  { value: 'scientific-abstract', label: 'Generate a scientific abstract about climate change impacts on marine biodiversity' },
  { value: 'data-science-blog', label: 'Write a data science blog post introduction about the importance of data visualization' },
  { value: 'statistical-concept', label: 'Explain the concept of p-values in statistical hypothesis testing' },
  { value: 'research-methods', label: 'Describe methods for conducting a randomized controlled experiment' },
  { value: 'ai-ethics', label: 'Write a paragraph about ethical considerations in AI development' },
];

// Demo prompts for image generation
export const demoImagePrompts = [
  { value: 'data-visualization', label: 'A beautiful data visualization dashboard showing statistical charts and graphs' },
  { value: 'brain-scan', label: 'A detailed 3D rendering of a human brain with highlighted neural pathways' },
  { value: 'statistical-concept', label: 'A visual representation of the normal distribution and standard deviation' },
  { value: 'research-methods', label: 'Scientists analyzing data in a modern laboratory setting' },
  { value: 'science-education', label: 'An engaging classroom scene with students learning about data science' },
];

// Demo questions for the Ask tab
export const demoQuestions = [
  { value: 'linear-regression', label: 'Perform a linear regression analysis on the dataset and visualize the results' },
  { value: 'clustering', label: 'Apply k-means clustering to the data and show the clusters in a scatter plot' },
  { value: 'correlation', label: 'Show the correlation between all numeric variables in a heatmap' },
  { value: 'summary-stats', label: 'Generate summary statistics for all variables in the dataset' },
  { value: 'visualization', label: 'Create a boxplot for each numeric variable grouped by a categorical variable' },
];

// Demo model choices for AI models
export const demoModelChoices = [
  { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Faster)' },
  { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
];

// Sample data for demonstrations
export const sampleData = {
  attitude: [
    { rating: 43, complaints: 51, privileges: 30, learning: 39, raises: 61, critical: 92, advance: 45 },
    { rating: 63, complaints: 64, privileges: 51, learning: 54, raises: 63, critical: 73, advance: 47 },
    { rating: 71, complaints: 70, privileges: 68, learning: 69, raises: 76, critical: 86, advance: 48 },
    { rating: 61, complaints: 63, privileges: 45, learning: 47, raises: 54, critical: 84, advance: 35 },
    { rating: 81, complaints: 78, privileges: 56, learning: 66, raises: 71, critical: 83, advance: 47 },
    { rating: 43, complaints: 55, privileges: 49, learning: 44, raises: 54, critical: 49, advance: 34 },
    { rating: 58, complaints: 67, privileges: 42, learning: 56, raises: 66, critical: 68, advance: 35 },
    { rating: 71, complaints: 75, privileges: 50, learning: 55, raises: 70, critical: 66, advance: 41 },
    { rating: 72, complaints: 82, privileges: 72, learning: 67, raises: 71, critical: 83, advance: 31 },
    { rating: 67, complaints: 61, privileges: 45, learning: 47, raises: 62, critical: 80, advance: 41 },
  ],
  
  // Add more sample datasets as needed
};
