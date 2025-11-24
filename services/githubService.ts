import { Company, ProblemFile, Problem, Difficulty, GitHubContent } from '../types';

const REPO_OWNER = 'liquidslr';
const REPO_NAME = 'leetcode-company-wise-problems';
const BASE_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;

// Helper to handle rate limits gracefully-ish by checking response
const fetchGitHub = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Please try again in an hour.");
    }
    throw new Error(`GitHub API Error: ${response.statusText}`);
  }
  return response.json();
};

export const fetchCompanies = async (): Promise<Company[]> => {
  try {
    const data: GitHubContent[] = await fetchGitHub(BASE_API);
    // Filter only directories, ignore hidden files
    return data
      .filter(item => item.type === 'dir' && !item.name.startsWith('.'))
      .map(item => ({
        name: item.name,
        path: item.path,
        type: item.type
      }));
  } catch (error) {
    console.error("Failed to fetch companies", error);
    throw error;
  }
};

export const fetchCompanyFiles = async (companyPath: string): Promise<ProblemFile[]> => {
  try {
    // We need to encode the path for the URL
    const url = `${BASE_API}/${encodeURIComponent(companyPath)}`;
    const data: GitHubContent[] = await fetchGitHub(url);
    
    return data
      .filter(item => item.name.endsWith('.csv'))
      .map(item => ({
        name: item.name.replace('.csv', ''),
        path: item.path,
        download_url: item.download_url || ''
      }));
  } catch (error) {
    console.error(`Failed to fetch files for ${companyPath}`, error);
    throw error;
  }
};

export const fetchAndParseCSV = async (downloadUrl: string, companyName: string): Promise<Problem[]> => {
  try {
    const response = await fetch(downloadUrl);
    const text = await response.text();
    return parseCSV(text, companyName);
  } catch (error) {
    console.error("Failed to download CSV", error);
    throw error;
  }
};

const parseCSV = (csvText: string, companyName: string): Problem[] => {
  const lines = csvText.split('\n');
  const problems: Problem[] = [];
  
  if (lines.length < 2) return []; // Need at least header + 1 data line

  // Parse CSV with proper quoted field handling
  const parseCSVLine = (line: string): string[] => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current.trim());
    
    return fields;
  };

  // Parse header to get column indices
  const header = parseCSVLine(lines[0]);
  const difficultyIdx = header.findIndex(h => h.toLowerCase().includes('difficulty'));
  const titleIdx = header.findIndex(h => h.toLowerCase().includes('title'));
  const frequencyIdx = header.findIndex(h => h.toLowerCase().includes('frequency'));
  const acceptanceIdx = header.findIndex(h => h.toLowerCase().includes('acceptance'));
  const linkIdx = header.findIndex(h => h.toLowerCase().includes('link'));
  const topicsIdx = header.findIndex(h => h.toLowerCase().includes('topics'));

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    if (fields.length < 2) continue;

    // Extract difficulty
    let difficulty = Difficulty.Unknown;
    if (difficultyIdx >= 0 && fields[difficultyIdx]) {
      const diffStr = fields[difficultyIdx].toUpperCase();
      if (diffStr === 'EASY') difficulty = Difficulty.Easy;
      else if (diffStr === 'MEDIUM') difficulty = Difficulty.Medium;
      else if (diffStr === 'HARD') difficulty = Difficulty.Hard;
    }

    // Extract title
    const title = titleIdx >= 0 ? fields[titleIdx] : '';
    if (!title) continue;

    // Extract frequency
    const frequency = frequencyIdx >= 0 ? fields[frequencyIdx] : '0';

    // Extract acceptance (convert decimal to percentage)
    let acceptance = '0%';
    if (acceptanceIdx >= 0 && fields[acceptanceIdx]) {
      const acceptanceVal = parseFloat(fields[acceptanceIdx]);
      if (!isNaN(acceptanceVal)) {
        acceptance = `${(acceptanceVal * 100).toFixed(1)}%`;
      }
    }

    // Extract URL
    let url = linkIdx >= 0 ? fields[linkIdx] : '';
    if (!url || !url.startsWith('http')) {
      url = `https://leetcode.com/problemset/all/?search=${encodeURIComponent(title)}`;
    }

    // Extract topics
    const topics = topicsIdx >= 0 ? fields[topicsIdx] : '';

    // Generate ID from URL (extract problem slug)
    const urlMatch = url.match(/\/problems\/([^/]+)/);
    const id = urlMatch ? urlMatch[1] : title.toLowerCase().replace(/\s+/g, '-');

    problems.push({
      id,
      title,
      difficulty,
      acceptance,
      frequency,
      url,
      company: companyName,
      topics
    });
  }

  return problems;
};