
import {defineSelector, defineView, include} from 'epic-linker';
import {hostTask} from 'alkindi-task-lib';

import process from 'process';
import SourceMapSupport from 'source-map-support';

import Task from './task';
import AnswerDialog from './answer_dialog';
import Workspace from './workspace';
export {default as generate} from './generate';

import 'font-awesome/css/font-awesome.css!';
import 'bootstrap/dist/css/bootstrap.css!';
import 'rc-tooltip/assets/bootstrap.css!';
import '2017-fr-al-01-reused-key.css/style.css!';

export function run (options) {
   if (process.env.NODE_ENV === 'development') {
      SourceMapSupport.install();
   }
   hostTask(options, function* (deps) {

      /* The Task view displays the task to the contestant.
         The standard 'TaskSelector' selector supplies the task object as a
         'task' prop. */
      yield defineView('Task', 'TaskSelector', Task);

      /* The AnswerDialog view should allow the contestant to enter answers.
         It should contain a submit button that calls the 'submit' prop when
         clicked, passing to it a JSON-serializable object containing the
         answers.
         The 'feedback' prop will contain task-specific feedback on the most
         recently submitted answer.
         If the view detects that the task is completed (based on the feedback,
         for example when the highest possible score is obtained), it should
         inform the user and allow them to click a button that calls the
         'onSuccess' prop. */
      yield defineView('AnswerDialog', 'AnswerDialogSelector', AnswerDialog);

      /* The workspace is the view that can be used by the contestant to solve
         the task. */
      yield include(Workspace);

   });
};
