import api from './api';

export const getSkillRadarData = () => {
  return api.get('/analysis/skill-radar');
};

export const getEligibilitySummary = () => {
  return api.get('/analysis/eligibility');
};

export const getSkillDistribution = () => {
  return api.get('/analysis/skill-distribution');
};

export const getCommonMissingSkills = () => {
  return api.get('/analysis/common-missing');
};
