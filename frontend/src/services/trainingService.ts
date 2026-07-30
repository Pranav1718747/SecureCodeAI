import api from './api';

export const trainingService = {
  triggerTrainingJob: (datasetId: string, baseModel: string) => {
    return api.post('/training/jobs/trigger/', {
      dataset_id: datasetId,
      base_model: baseModel,
    });
  },

  listJobs: () => {
    return api.get('/training/jobs/');
  },

  getJob: (id: string) => {
    return api.get(`/training/jobs/${id}/`);
  },

  listFeedbackEvents: () => {
    return api.get('/training/feedback/');
  },

  submitFeedback: (patchId: string, action: string, notes: string) => {
    return api.post('/training/feedback/', {
      patch: patchId,
      action,
      reviewer_notes: notes,
    });
  },
};
