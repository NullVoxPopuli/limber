export const inIframe = () => window.self !== window.top;

export const notInIframe = () => !inIframe();

export default inIframe;
