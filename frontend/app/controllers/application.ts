import Controller from '@ember/controller';

/**
 * See RFCs
 *  - https://github.com/emberjs/rfcs/pull/712/
 *  - https://github.com/emberjs/rfcs/pull/715/
 *
 *  After 715, this file may be deleted
 */
export default class ApplicationController extends Controller {
  queryParams = [
    // Code
    't',
    // Maximize / Minimize of the Editor
    // "min" | "max"
    'editor',
  ];
}
