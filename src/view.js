import onChange from 'on-change';

export default (elements, i18n, initialState) => {
    const renderForm = (state) => {
        const { feedback } = elements;
        if(state.form.valid) {
            feedback.classList.remove('is-invalid');
        } else {
            feedback.classList.add('is-invalid');
         };
    };

    const renderFeedback = (state) => {
        const { feedback } = elements;
        if (state.feedback.valid) {
            feedback.classList.remove('text-danger');
            feedback.classList.add('text-success');
          } else {
            feedback.classList.add('text-danger');
            feedback.classList.remove('text-success');
          }
      
          feedback.textContent = state.feedback.message;
    };
    
    const state = onChange(initialState, (path) => {
        switch (path) {
          case 'form.valid':
            renderForm(state);
            break;
          case 'feedback.valid':
          case 'feedback.message':
            renderFeedback(state);
            break;
          default:
            break;
        }
      });
    
      return state;
};