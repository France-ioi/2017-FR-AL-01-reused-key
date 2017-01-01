import React from 'react';
import EpicComponent from 'epic-component';
import {Alert, Button} from 'react-bootstrap';

const AnswerDialog = EpicComponent(self => {

   let number;
   const refNumber = el => { number = el; };

   const onSubmit = function () {
      self.props.submit({
         n: number.value
      });
   };

   self.componentDidMount = function () {
      // When the component mounts, select the input box.
      number && number.focus();
   };

   self.render = function () {
      /* Currently answers is provided by the platform and contains a view of
         previously submitted answers.  This part of the interface will likely
         change. */
      const {answers, feedback, onSuccess} = self.props;
      return (
         <div>
            <div className='section'>
               <p>
                  Enter your answer here:
               </p>
               <p className="input">
                  <label htmlFor="answer-n">{'Number : '}</label>
                  <input type="text" id="answer-n" ref={refNumber1} />
               </p>
               <p><Button onClick={onSubmit}>Submit</Button></p>
            </div>
            {feedback && <Feedback feedback={feedback} onSuccess={onSuccess}/>}
            <div className='section'>
               {answers}
            </div>
            <div className='section'>
               <p>
                  The answer is a number between 0 and 100.
               </p>
            </div>
         </div>
      );
   };

});

const Feedback = EpicComponent(self => {

   self.render = function () {
      const {feedback, onSuccess} = self.props;
      return (
         <div>
            {feedback.tooSmall &&
               <Alert bsStyle='warning'>
                  <p>Your answer is too small.</p>
               </Alert>}
            {feedback.tooLarge &&
               <Alert bsStyle='warning'>
                  <p>Your answer is too large.</p>
               </Alert>}
            {feedback.equal &&
               <Alert bsStyle='success'>
                  <p>Your answer is correct!  You have completed the task.</p>
                  <p className="text-center">
                     <Button bsStyle="primary" bsSize="large" onClick={onSuccess}>
                        <i className="fa fa-left-arrow"/> back
                     </Button>
                  </p>
               </Alert>}
         </div>
      );
   };

});

export default AnswerDialog;
