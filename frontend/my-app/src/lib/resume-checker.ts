// Types for resume checker
export interface ResumeCheckerRequest {
  resumes: File[];
  jobDescriptions: File[];
  maxScore?: number;
  cutoffScore?: number;
}

export interface ResumeCheckerResult {
  resume_name: string;
  jd_name: string;
  score: number;
  reasoning: string;
  chunks_used: number;
  jd_index: number;
  resume_index: number;
}

export interface ResumeCheckerResponse {
  results: ResumeCheckerResult[];
  total_processed: number;
  processing_time: number;
}

// Resume checker API client
export class ResumeCheckerAPI {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:8501') {
    this.baseUrl = baseUrl;
  }

  // Check resumes against job descriptions
  async checkResumes(request: ResumeCheckerRequest): Promise<ResumeCheckerResponse> {
    try {
      const formData = new FormData();
      
      // Add resumes
      request.resumes.forEach((resume, index) => {
        formData.append(`resume_${index}`, resume);
      });
      
      // Add job descriptions
      request.jobDescriptions.forEach((jd, index) => {
        formData.append(`jd_${index}`, jd);
      });
      
      // Add configuration
      if (request.maxScore) {
        formData.append('max_score', request.maxScore.toString());
      }
      if (request.cutoffScore) {
        formData.append('cutoff_score', request.cutoffScore.toString());
      }

      const response = await fetch(`${this.baseUrl}/api/resume-checker`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking resumes:', error);
      throw error;
    }
  }

  // Check single resume against single JD
  async checkSingleResume(
    resume: File, 
    jobDescription: string, 
    maxScore: number = 100, 
    cutoffScore: number = 70
  ): Promise<{ score: number; reasoning: string }> {
    try {
      const formData = new FormData();
      formData.append('resume', resume);
      formData.append('job_description', jobDescription);
      formData.append('max_score', maxScore.toString());
      formData.append('cutoff_score', cutoffScore.toString());

      const response = await fetch(`${this.baseUrl}/api/single-resume-check`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        score: data.score,
        reasoning: data.reasoning
      };
    } catch (error) {
      console.error('Error checking single resume:', error);
      throw error;
    }
  }

  // Get processing status
  async getStatus(): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/status`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting status:', error);
      throw error;
    }
  }
}

// Default instance
export const resumeCheckerAPI = new ResumeCheckerAPI();

// Utility functions for resume checking
export const validateResumeFile = (file: File): boolean => {
  const validTypes = ['application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const validateJobDescriptionFile = (file: File): boolean => {
  const validTypes = ['application/pdf', 'text/plain'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
};

export const formatScore = (score: number): string => {
  return `${score.toFixed(1)}/100`;
};

export const getScoreColor = (score: number, cutoff: number = 70): string => {
  if (score >= cutoff) {
    return 'text-success-600';
  } else if (score >= cutoff * 0.8) {
    return 'text-warning-600';
  } else {
    return 'text-error-600';
  }
};

export const getScoreStatus = (score: number, cutoff: number = 70): string => {
  if (score >= cutoff) {
    return 'PASSED';
  } else {
    return 'FAILED';
  }
}; 