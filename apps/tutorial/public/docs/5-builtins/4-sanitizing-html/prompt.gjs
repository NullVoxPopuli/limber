import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

// Import DOMPurify (in a real app, you would install this package)
const DOMPurify = {
  sanitize: (html, options = {}) => {
    // This is a simplified version of DOMPurify for demonstration
    // It removes script tags and onclick attributes
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  }
};

class SafeHtml extends Component {
  get sanitizedContent() {
    // TODO: Sanitize the HTML content and mark it as safe
    return this.args.content;
  }

  <template>
    <div class="safe-html-container">
      {{this.sanitizedContent}}
    </div>
  </template>
}

<template>
  <h3>Safe HTML Example</h3>
  
  <SafeHtml @content="<p>This is <strong>safe</strong> HTML</p>" />
  
  <h3>Unsafe HTML Example</h3>
  
  <SafeHtml @content="<p>This has a <script>alert('XSS attack!')</script> script tag</p>" />
  
  <h3>Another Unsafe Example</h3>
  
  <SafeHtml @content="<button onclick=\"alert('Clicked!')\">Dangerous Button</button>" />
</template>
