# Javascript library for Virtual Collection Registry integrations

Widget and API for easy integration with the [Virtual Collection Registry](https://collections.clarin.eu) (VCR)

![Build and test workflow](https://github.com/clarin-eric/js-vcr-integration/actions/workflows/webpack.yml/badge.svg?branch=main)
![Documentation](https://github.com/clarin-eric/js-vcr-integration/actions/workflows/pages/pages-build-deployment/badge.svg?branch=main)

## Main features

* Queueing of items (with URL/PID, title and description) for submission to the VCR
* Submission queue component with listing and submit, clear, hide/show controls
* Declarative integration (no custom JS code required)
* Optional programmatic control of queue and queue component
* Style can be partially or fully overridden

## Usage

Load the script in the `<head>` section of an HTML document:
```html
<script type="text/javascript" defer="defer" src="https://collections.clarin.eu/script/vcr-integration/v1/vcr-integration.js"></script>
```

Define and annotate links for adding items to the queue:
```html
Some resource
    (<a  data-vcr-url="http://doi.org/10.5555/12345678" 
    data-vcr-title="Some resource">Add to virtual collection</a>)
(...)
Other resource 
    (<a  data-vcr-url="https://tinyurl.com/my-resource" 
    data-vcr-title="Some other resource">Add to virtual collection</a>)
```

That is it. If a user clicks one of the annotated links a queue component will appear, allowing the user to manage the
queue (i.e. remove items or clear the entire queue) and eventually submit the queue to the Virtual Collection Registry.

### Programmatic control

After initalisation, a control object becomes available as `window.vcrIntegration`. It exposes an API that is
[separately documented](https://clarin-eric.github.io/js-vcr-integration/VCRIntegration.html). Actions include queue
item addition and removal, hiding and showing of the queue component, and changing any of the configuration properties
(see below).

## Configuration

**Optionally** a configuration object can be defined in the `<head>` section and made available for use by the library 
by assigning it to `window.vcrIntegrationConfiguration`:
```html
<script script type="text/javascript">
    window.vcrIntegrationConfiguration = {
        'queueControlPosition': 'bottom-right'
    };
</script>
```

The follow properties are supported:
* `logLevel`: Log level for console output 
  * Value must be one of `debug`, `info`, `warn` or `silent`; see [loglevel](https://github.com/pimterry/loglevel)
  * Defaults to `info`
* `autoInitialize`: Set to `false` to disable automatic initialisation of the plugin
  * Doing this renders the plugin inactive until programatically activated with a call to `window.initVcrIntegration()` 
  * Defaults to `true`
* `endpointUrl`: Base URL of the Virtual Collection endpoint 
  * Defaults to `https://collections.clarin.eu/submit/extensional`
* `queueControlPosition`: Position for rendering the queue component 
  * One of `top-right`, `bottom-right`, `bottom-left` or `top-left`
  * Defaults to `bottom-right`
* `defaultName`: Default name for a new collection
  * Leave unconfigured for no default name
* `icons`: Can be used to pass an array that defines markup for icons to replace the default icons. See `Icons.js`
for a list of properties.
* `autoDisableAddedItemLinks`: ..
* `customQueueComponentClass`: ..

## Customisation

### CSS

`*TODO*`

### Icons

`*TODO*`
