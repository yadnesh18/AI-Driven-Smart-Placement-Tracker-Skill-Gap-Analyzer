import api from './api';

// Run analysis for a specific company
export const runAnalysis = (companyId) => {
  return api.post('/student/analysis/run', { companyId });
};

// Get skill radar data (latest analysis)
export const getSkillRadarData = () => {
  return api.get('/student/analysis/skill-radar');
};

// Generate personalised roadmap
export const generateRoadmap = (data) => {
  return api.post('/student/analysis/roadmap', data);
};
