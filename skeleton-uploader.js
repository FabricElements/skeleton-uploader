/* eslint-disable max-len */
/* eslint-disable-next-line max-len */
import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-icons/iron-icons.js';

/**
 * `skeleton-uploader`
 *
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class SkeletonUploader extends PolymerElement {
  /**
   * @return {!HTMLTemplateElement}
   */
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          width: auto;
          position: relative;
        }

        #drop-area {
          border-radius: 5px;
          text-align: center;
          cursor: pointer;
        }

        #progress-bar {
          background-color: var(--paper-green-500);
          bottom: 0;
          left: 0;
          opacity: 1;
          pointer-events: none;
          position: absolute;
          top: 0;
          transition: all 500ms linear;
          z-index: 10;
        }

        #progress-bar.uploaded-true {
          opacity: 0;
          transition-duration: 500ms;
        }

        [hidden] {
          display: none;
        }

        paper-button {
          color: white;
          transition: transform 500ms linear;
        }

        .uploaderButton:active {
          transform: scale(0.9);
        }

        paper-button iron-icon {
          margin-right: 10px;
        }

        paper-button.default {
          background-color: var(--paper-blue-500);
        }

        paper-button.uploading {
          background-color: var(--paper-grey-500);
        }

        paper-button.done {
          background-color: var(--paper-green-500);
        }

        paper-button.failed {
          background-color: var(--paper-red-500);
        }

        paper-icon-button {
          color: var(--paper-red-500);
        }

        paper-button[disabled] {
          background-color: var(--paper-grey-400);
        }
      </style>
      <input
        id="media-capture"
        type="file"
        accept="[[accept]]"
        on-change="_upload"
        hidden
        size="5242880"
        disabled$="[[isUploadDisabled]]"
      />
      <paper-button
        class$="[[buttonState]]
                    uploaderButton"
        disabled$="[[disabled]]"
        on-tap="_tapButton"
      >
        <div id="drop-area">
          <div
            id="progress-bar"
            class$="uploaded-[[uploaded]]"
            style$="width:[[uploadProgress]]%;"
          ></div>
          <iron-icon icon="[[buttonIcon]]"></iron-icon>
          [[buttonText]]
        </div>
      </paper-button>
      <paper-icon-button
        icon="cancel"
        hidden$="[[!showCancel]]"
        on-tap="_resetButton"
      ></paper-icon-button>
    `;
  }

  /**
   * @return {string}
   */
  static get is() {
    return 'skeleton-uploader';
  }

  /**
   * @return {object}
   */
  static get properties() {
    return {
      path: {
        type: String,
        value: null,
      },
      extension: {
        type: String,
        value: null,
      },
      accept: {
        type: String,
        value: null,
      },
      downloadUrl: {
        type: String,
        value: null,
      },
      uploadProgress: {
        type: Number,
        value: 0,
      },
      titlePreview: {
        type: String,
        value: 'Drop file to upload',
      },
      uploaded: {
        type: Boolean,
        value: false,
        notify: true,
        computed: '_getUploaded(uploadProgress)',
      },
      metadata: {
        type: Object,
        value: {},
      },
      buttonState: {
        type: String,
        value: 'default',
        observer: '_stateObserver',
      },
      buttonText: {
        type: String,
        value: 'Upload',
      },
      buttonIcon: {
        type: String,
        value: 'cloud-upload',
      },
      showCancel: {
        type: Boolean,
        value: false,
      },
      isUploadDisabled: {
        type: Boolean,
        value: false,
      },
      disabled: {
        type: Boolean,
        value: false,
      },
      maxSize: {
        type: Number,
        value: 0,
      },
      minSize: {
        type: Number,
        value: 0,
      },
    };
  }

  /**
   * Ready event
   */
  connectedCallback() {
    super.connectedCallback();
    const dropzone = this.shadowRoot.querySelector('#drop-area');

    dropzone.ondrop = (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (!this.uploadProgress) {
        this._upload(e, e.dataTransfer.files[0]);
      }
    };

    dropzone.ondragover = function() {
      dropzone.classList.add('dragover');
      return false;
    };

    dropzone.ondragleave = function() {
      dropzone.classList.remove('dragover');
      return false;
    };
  }

  /**
   * Choose a file.
   *
   */
  chooseFile() {
    if (this.buttonState !== 'uploading') {
      const input = this.shadowRoot.querySelector('input');
      input.value = null;
      input.click();
    }
  }

  /**
   * get uploaded
   *
   * @param {number} uploadProgress
   * @return {boolean}
   * @private
   */
  _getUploaded(uploadProgress) {
    return uploadProgress === 100;
  }

  /**
   * Upload
   *
   * @param {object} event
   * @param {object} fileObject
   * @private
   */
  _upload(event, fileObject) {
    const file = fileObject
      ? fileObject
      : this.shadowRoot.querySelector('#media-capture').files[0];
    const fileSize = this.shadowRoot.querySelector('#media-capture').files[0]
      .size;
    if (this.maxSize !== 0 && fileSize > this.maxSize) {
      this.buttonState = 'failed';
      this._dispatchEvent('error', 'File size is bigger than specified');
      return;
    }
    if (this.minSize != 0 && fileSize < this.minSize) {
      this.buttonState = 'failed';
      this._dispatchEvent('error', 'File size is smaller than specified');
      return;
    }
    this.downloadURL = null;
    const fileName = file.name;
    this.titlePreview = fileName;
    let fileExt = /\.[\w]+/.exec(file.name);
    const storageRef = firebase.storage().ref(this.path + fileExt);
    let metadataObject = null;
    if (this.metadata && typeof this.metadata === 'object') {
      metadataObject = {
        customMetadata: this.metadata,
      };
    } else if (this.metadata && typeof this.metadata !== 'object') {
      this.buttonState = 'failed';
      this._dispatchEvent('error', 'Metadata should be an object');
      return;
    }
    this.task = storageRef.put(file, metadataObject);
    this.task.on(
      'state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        this.uploadProgress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        this.buttonState = 'uploading';
        switch (snapshot.state) {
          case firebase.storage.TaskState.PAUSED: // or 'paused'
            this._dispatchEvent('paused', 'Upload is paused');
            break;
          case firebase.storage.TaskState.RUNNING: // or 'running'
            this._dispatchEvent('running', 'Upload is running');
            break;
        }
      },
      (error) => {
        error.code === 'storage/canceled'
          ? (this.buttonState = 'default')
          : (this.buttonState = 'failed');
        // Handle unsuccessful uploads
        this._dispatchEvent('error', error);
      },
      () => {
        this.task.snapshot.ref.getDownloadURL().then((downloadURL) => {
          // Handle successful uploads on complete
          this.downloadURL = downloadURL;
          this.extension = fileExt[0];
          this._dispatchEvent('completed', {
            type: file.type,
            url: this.downloadURL,
            name: fileName,
          });
          this.buttonState = 'done';
        });
      }
    );
  }

  /**
   * Remove file from storage
   *
   * @return {*}
   */
  removeFile() {
    const pathRef = firebase
      .storage()
      .ref()
      .child(this.path + this.extension);
    // Get the download URL
    return pathRef
      .delete()
      .then(() => (this.src = null))
      .catch((error) => (this.error = error));
  }

  /**
   * Dispatch event
   *
   * @param {string} event
   * @param  {string} detail
   * @private
   */
  _dispatchEvent(event, detail) {
    this.dispatchEvent(
      new CustomEvent(event, {
        detail: detail,
        bubbles: true,
        composed: true,
      })
    );
  }

  /**
   * State observer
   * @param {string} state
   * @private
   */
  _stateObserver(state) {
    if (!state) return;
    this.showCancel = false;
    this.isUploadDisabled = false;
    if (state === 'default') {
      this.buttonText = 'Upload';
      this.buttonIcon = 'cloud-upload';
    }
    if (state === 'uploading') {
      this.buttonText = 'Uploading';
      this.buttonIcon = 'refresh';
      this.showCancel = true;
      this.isUploadDisabled = true;
    }
    if (state === 'done') {
      this.buttonText = 'Done';
      this.buttonIcon = 'cloud-done';
      this.isUploadDisabled = true;
      setTimeout(() => {
        this._resetButton();
      }, 3000);
    }
    if (state === 'failed') {
      this.buttonText = 'Failed';
      this.buttonIcon = 'clear';
      this.isUploadDisabled = true;
      setTimeout(() => {
        this._resetButton();
      }, 5000);
    }
  }

  /**
   * Tap button
   * @private
   */
  _tapButton() {
    if (this.buttonState === 'done' || this.buttonState === 'failed') {
      this._resetButton();
    }
    this.chooseFile();
  }

  /**
   * Reset button
   * @private
   */
  _resetButton() {
    this.uploadProgress = 0;
    this.buttonState = 'default';
    if (this.task) this.task.cancel();
  }
}

window.customElements.define(SkeletonUploader.is, SkeletonUploader);
