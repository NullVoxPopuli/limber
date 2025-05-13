You need to fetch data from the API corresponding to the selected option in the first dropdown. This requires creating a function that builds the correct API URL based on the selected value.

In this example, the fetching of data from the [Options][swapi]
should occur automatically based on changes in option selected`.

   ```javascript
   function urlForDataSource(selectedData) {
       return `https://swapi.dev/api/${selectedData}/`;
   }
   ```

Use the `RemoteData` utility to manage the asynchronous data fetching. This will allow you to handle loading states and response values effectively. 

  ```hbs
    {{#let (RemoteData (urlForDataSource selectedAPI.current)) as |request|}}
    {{/let}}
  ```

After fetching the data, you need to update the second dropdown with the results. Use the `names` function to extract the names from the fetched data and pass them as options to the second dropdown.

   ```javascript
   function names(options) {
       return options.map(option => option.name);
   }
   ```

   ```hbs
   {{#let (RemoteData (urlForDataSource selectedAPI.current)) as |request|}}
      {{#if request.value}}
        <Select 
          @options={{names request.value.results}} 
          @onChange={{(fn setSelected selectedAPI.current)}} 
        />
    {{/if}}
   {{/let}}
   ```
Use conditional rendering to display a loading message while the API call is in progress. This enhances user experience by providing feedback on the data fetching process.

   ```hbs
    {{#if request.isLoading}}
      Loading...
    {{/if}}
   ```

Docs for `RemoteData` can [be found here][docs-remote-data].

[docs-remote-data]: https://reactive.nullvoxpopuli.com/functions/remote_data.RemoteData-1.html
[swapi]: https://swapi.dev/
