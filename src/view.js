import onChange from 'on-change';

export default (elements, i18n, initialState) => {
    const renderForm = (state) => {
        const { input } = elements;
        if (state.form.valid) {
            input.classList.remove('is-invalid');
        } else {
            input.classList.add('is-invalid');
         };
    };

    const renderFeedback = (state) => {
        const { feedback } = elements;
        if (state.feedback.valid) {
            feedback.classList.remove('text-danger');
            feedback.classList.add('text-success');
          } else {
            feedback.classList.remove('text-success');
            feedback.classList.add('text-danger');
          }
          feedback.textContent = state.feedback.message;
    };
    
    const state = onChange(initialState, (path) => {
        switch (path) {
          case 'form.valid':
            renderForm(state);
            break;
          case 'feedback.message':
            renderFeedback(state);
            break;
          default:
            break;
        }
      });
    
      return state;
};