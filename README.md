## \<skeleton-uploader\>

`skeleton-uploader` is a [Polymer 3](http://polymer-project.org) and [Firebase](https://firebase.google.com/) element for uploading files with a progress indication bar and drag and drop capability.

## Installation

Install skeleton-uploader with npm

```shell
$ npm install FabricElements/skeleton-uploader --save
```

## Usage

Import it into the `<head>` of your page

```html
<script type="module" src="node_modules/@fabricelements/skeleton-uploader/skeleton-uploader.js"></script>
```

### Example: basic usage

Configure your Firebase app

> See [Firebase](https://firebase.google.com/docs/storage/web/start) docs for more information.

Then add the `skeleton-uploader` element.

```html
<skeleton-uploader disabled="[[!signedIn]]"
                   path="demo.jpg"></skeleton-uploader>
```

### Attributes


* `path` (string) - Firebase storage reference.
* `disabled` (boolean) - Disable option.

### Other attributes

* `accept` (string) - MIME type accepted.
* `downloadUrl` (string) - The download URL.
* `uploadProgress` (number) - The upload progress of the image.
* `uploaded` (boolean) - True when the image is uploaded.
* `metadata` (object) - The metadata to save along with the image.
* `buttonState` (string) - The button state.
* `buttonText` (string) - The button text.
* `buttonIcon` (string) - The button icon.
* `showCancel` (boolean) - Shows cancel button. 
* `isUploadDisabled` (boolean) - Disable input option

## Contributing

Please check [CONTRIBUTING](./CONTRIBUTING.md).

## License

Released under the [BSD 3-Clause License](./LICENSE.md).
