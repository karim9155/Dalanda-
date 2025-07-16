import "./chunk-BCVAZNZP.js";
import "./chunk-4UTA6RAC.js";
import {
  MatFormFieldControl
} from "./chunk-YYYDHU6W.js";
import {
  FormGroupDirective,
  NgControl,
  NgForm
} from "./chunk-MYSCWDAN.js";
import "./chunk-5G4RZGQP.js";
import "./chunk-IS4I5LDK.js";
import "./chunk-PAMXP5EF.js";
import "./chunk-B22PZ7QE.js";
import "./chunk-4TJBFUHM.js";
import {
  ErrorStateMatcher
} from "./chunk-5AR7W2B6.js";
import "./chunk-3PB5T2NP.js";
import "./chunk-LVP7HOXU.js";
import "./chunk-JPMPFWQ6.js";
import "./chunk-UAEVGWKA.js";
import {
  coerceBooleanProperty
} from "./chunk-37JVYMH4.js";
import "./chunk-OHWI2S6G.js";
import "./chunk-IJ3KGSPX.js";
import {
  FocusMonitor
} from "./chunk-L5N6IVMR.js";
import "./chunk-7P5WSSQN.js";
import "./chunk-TITWNDOM.js";
import "./chunk-E5WKDJD7.js";
import "./chunk-VOSIYPZB.js";
import "./chunk-NEGS3YYM.js";
import {
  Component,
  ElementRef,
  HostBinding,
  HostListener,
  Inject,
  InjectionToken,
  Input,
  NgModule,
  Optional,
  Pipe,
  Renderer2,
  Self,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵdefineComponent,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdefinePipe,
  ɵɵdirectiveInject,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵhostProperty,
  ɵɵlistener,
  ɵɵproperty,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-Z67EBTI5.js";
import "./chunk-6Q4RANH6.js";
import "./chunk-FFZIAYYX.js";
import {
  Subject
} from "./chunk-CXCX2JKZ.js";

// node_modules/ngx-custom-material-file-input/fesm2022/ngx-custom-material-file-input.mjs
var FileInputBase = class {
  constructor(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl, stateChanges) {
    this._defaultErrorStateMatcher = _defaultErrorStateMatcher;
    this._parentForm = _parentForm;
    this._parentFormGroup = _parentFormGroup;
    this.ngControl = ngControl;
    this.stateChanges = stateChanges;
    this._errorState = false;
  }
  /** Determines whether the control is in an error state */
  get errorState() {
    const control = this.ngControl?.control || null;
    const form = this._parentForm || this._parentFormGroup || null;
    return this._defaultErrorStateMatcher.isErrorState(control, form);
  }
  /** Triggers error state update */
  updateErrorState() {
    const previousState = this._errorState;
    this._errorState = this.errorState;
    if (previousState !== this._errorState) {
      this.stateChanges.next();
    }
  }
};
var FileInput = class {
  constructor(_files, delimiter = ", ") {
    this._files = _files;
    this.delimiter = delimiter;
    this._fileNames = (this._files || []).map((f) => f.name).join(delimiter);
  }
  get files() {
    return this._files || [];
  }
  get fileNames() {
    return this._fileNames;
  }
};
var FileInputComponent = class _FileInputComponent extends FileInputBase {
  static {
    this.nextId = 0;
  }
  get errorState() {
    const control = this.ngControl?.control || null;
    const form = this._parentForm || this._parentFormGroup || null;
    const matcher = this.errorStateMatcher || this._defaultErrorStateMatcher;
    return matcher.isErrorState(control, form);
  }
  setDescribedByIds(ids) {
    this.describedBy = ids.join(" ");
  }
  get value() {
    return this.empty ? null : new FileInput(this._elementRef.nativeElement.value || []);
  }
  set value(fileInput) {
    if (fileInput) {
      this.writeValue(fileInput);
      this.stateChanges.next();
    }
  }
  get multiple() {
    return this._multiple;
  }
  set multiple(value) {
    this._multiple = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  get placeholder() {
    return this._placeholder;
  }
  set placeholder(plh) {
    this._placeholder = plh;
    this.stateChanges.next();
  }
  /**
   * Whether the current input has files
   */
  get empty() {
    return !this._elementRef.nativeElement.value || this._elementRef.nativeElement.value.length === 0;
  }
  get shouldLabelFloat() {
    return this.focused || !this.empty || this.valuePlaceholder !== void 0;
  }
  get required() {
    return this._required;
  }
  set required(req) {
    this._required = coerceBooleanProperty(req);
    this.stateChanges.next();
  }
  get isDisabled() {
    return this.disabled;
  }
  get disabled() {
    return this._elementRef.nativeElement.disabled;
  }
  set disabled(dis) {
    this.setDisabledState(coerceBooleanProperty(dis));
    this.stateChanges.next();
  }
  get previewUrls() {
    return this._previewUrls;
  }
  onContainerClick(event) {
    if (event.target.tagName.toLowerCase() !== "input" && !this.disabled) {
      this._elementRef.nativeElement.querySelector("input").focus();
      this.focused = true;
      this.open();
    }
  }
  /**
   * @see https://angular.io/api/forms/ControlValueAccessor
   */
  constructor(fm, _elementRef, _renderer, _defaultErrorStateMatcher, ngControl, _parentForm, _parentFormGroup) {
    super(_defaultErrorStateMatcher, _parentForm, _parentFormGroup, ngControl, new Subject());
    this.fm = fm;
    this._elementRef = _elementRef;
    this._renderer = _renderer;
    this._defaultErrorStateMatcher = _defaultErrorStateMatcher;
    this.ngControl = ngControl;
    this._parentForm = _parentForm;
    this._parentFormGroup = _parentFormGroup;
    this.focused = false;
    this.controlType = "file-input";
    this.autofilled = false;
    this._required = false;
    this._multiple = false;
    this._previewUrls = [];
    this._objectURLs = [];
    this.accept = null;
    this.defaultIconBase64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0Ij48cGF0aCBkPSJNMCAwaDI0djI0SDBWMHoiIGZpbGw9Im5vbmUiLz48cGF0aCBkPSJNMTUgMkg2Yy0xLjEgMC0yIC45LTIgMnYxNmMwIDEuMS45IDIgMiAyaDEyYzEuMSAwIDItLjkgMi0yVjdsLTUtNXpNNiAyMFY0aDh2NGg0djEySDZ6bTEwLTEwdjVjMCAyLjIxLTEuNzkgNC00IDRzLTQtMS43OS00LTRWOC41YzAtMS40NyAxLjI2LTIuNjQgMi43Ni0yLjQ5IDEuMy4xMyAyLjI0IDEuMzIgMi4yNCAyLjYzVjE1aC0yVjguNWMwLS4yOC0uMjItLjUtLjUtLjVzLS41LjIyLS41LjVWMTVjMCAxLjEuOSAyIDIgMnMyLS45IDItMnYtNWgyeiIvPjwvc3ZnPg==";
    this.id = `ngx-mat-file-input-${_FileInputComponent.nextId++}`;
    this.describedBy = "";
    this._onChange = (_) => {
    };
    this._onTouched = () => {
    };
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
    fm.monitor(_elementRef.nativeElement, true).subscribe((origin) => {
      this.focused = !!origin;
      this.stateChanges.next();
    });
  }
  get fileNames() {
    return this.value ? this.value.fileNames : this.valuePlaceholder;
  }
  writeValue(obj) {
    this._renderer.setProperty(this._elementRef.nativeElement, "value", obj instanceof FileInput ? obj.files : null);
  }
  registerOnChange(fn) {
    this._onChange = fn;
  }
  registerOnTouched(fn) {
    this._onTouched = fn;
  }
  /**
   * Remove all files from the file input component
   * @param [event] optional event that may have triggered the clear action
   */
  clear(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.value = new FileInput([]);
    this._previewUrls = [];
    this._elementRef.nativeElement.querySelector("input").value = null;
    this._onChange(this.value);
  }
  change(event) {
    const fileList = event.target.files;
    if (!fileList) return;
    if (this.multiple) {
      const existingFiles = this.value?.files || [];
      const newFiles = [];
      for (let i = 0; i < fileList.length; i++) {
        newFiles.push(fileList[i]);
      }
      const updatedFiles = [...existingFiles, ...newFiles];
      this.value = new FileInput(updatedFiles);
    } else {
      this.value = new FileInput(Array.from(fileList));
    }
    this._onChange(this.value);
    this.updatePreviewUrls();
  }
  updatePreviewUrls() {
    this._objectURLs = [];
    if (this.value?.files?.length) {
      this._previewUrls = this.value.files.map((file) => {
        const isImage = file.type.startsWith("image/");
        if (isImage) {
          const url = URL.createObjectURL(file);
          this._objectURLs.push(url);
          return url;
        } else {
          return this.defaultIconBase64;
        }
      });
    } else {
      this._previewUrls = [];
    }
  }
  revokeObjectURLs() {
    this._objectURLs.forEach((url) => URL.revokeObjectURL(url));
    this._objectURLs = [];
  }
  removeFile(index) {
    if (!this.value?.files?.length) return;
    const updatedFiles = [...this.value.files];
    updatedFiles.splice(index, 1);
    this.value = new FileInput(updatedFiles);
    this._onChange(this.value);
    this.updatePreviewUrls();
  }
  blur() {
    this.focused = false;
    this._onTouched();
  }
  setDisabledState(isDisabled) {
    this._renderer.setProperty(this._elementRef.nativeElement, "disabled", isDisabled);
  }
  open() {
    if (!this.disabled) {
      this._elementRef.nativeElement.querySelector("input").click();
    }
  }
  ngOnInit() {
    this.multiple = coerceBooleanProperty(this.multiple);
  }
  ngOnDestroy() {
    this.revokeObjectURLs();
    this.stateChanges.complete();
    this.fm.stopMonitoring(this._elementRef.nativeElement);
  }
  ngDoCheck() {
    if (this.ngControl) {
      this.updateErrorState();
    }
  }
  static {
    this.ɵfac = function FileInputComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _FileInputComponent)(ɵɵdirectiveInject(FocusMonitor), ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(Renderer2), ɵɵdirectiveInject(ErrorStateMatcher), ɵɵdirectiveInject(NgControl, 10), ɵɵdirectiveInject(NgForm, 8), ɵɵdirectiveInject(FormGroupDirective, 8));
    };
  }
  static {
    this.ɵcmp = ɵɵdefineComponent({
      type: _FileInputComponent,
      selectors: [["ngx-mat-file-input"]],
      hostVars: 6,
      hostBindings: function FileInputComponent_HostBindings(rf, ctx) {
        if (rf & 1) {
          ɵɵlistener("change", function FileInputComponent_change_HostBindingHandler($event) {
            return ctx.change($event);
          })("focusout", function FileInputComponent_focusout_HostBindingHandler() {
            return ctx.blur();
          });
        }
        if (rf & 2) {
          ɵɵhostProperty("id", ctx.id);
          ɵɵattribute("aria-describedby", ctx.describedBy);
          ɵɵclassProp("mat-form-field-should-float", ctx.shouldLabelFloat)("file-input-disabled", ctx.isDisabled);
        }
      },
      inputs: {
        autofilled: "autofilled",
        valuePlaceholder: "valuePlaceholder",
        accept: "accept",
        errorStateMatcher: "errorStateMatcher",
        defaultIconBase64: "defaultIconBase64",
        value: "value",
        multiple: "multiple",
        placeholder: "placeholder",
        required: "required",
        disabled: "disabled"
      },
      standalone: false,
      features: [ɵɵProvidersFeature([{
        provide: MatFormFieldControl,
        useExisting: _FileInputComponent
      }]), ɵɵInheritDefinitionFeature],
      decls: 4,
      vars: 4,
      consts: [["input", ""], ["type", "file"], [1, "filename", 3, "title"]],
      template: function FileInputComponent_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵelement(0, "input", 1, 0);
          ɵɵelementStart(2, "span", 2);
          ɵɵtext(3);
          ɵɵelementEnd();
        }
        if (rf & 2) {
          ɵɵattribute("multiple", ctx.multiple ? "" : null)("accept", ctx.accept);
          ɵɵadvance(2);
          ɵɵproperty("title", ctx.fileNames);
          ɵɵadvance();
          ɵɵtextInterpolate(ctx.fileNames);
        }
      },
      styles: ["[_nghost-%COMP%]{display:inline-block;width:100%}[_nghost-%COMP%]:not(.file-input-disabled){cursor:pointer}input[_ngcontent-%COMP%]{width:0px;height:0px;opacity:0;overflow:hidden;position:absolute;z-index:-1}.filename[_ngcontent-%COMP%]{display:inline-block;text-overflow:ellipsis;overflow:hidden;width:100%}"]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(FileInputComponent, [{
    type: Component,
    args: [{
      selector: "ngx-mat-file-input",
      providers: [{
        provide: MatFormFieldControl,
        useExisting: FileInputComponent
      }],
      standalone: false,
      template: `<input\r
  #input\r
  type="file"\r
  [attr.multiple]="multiple ? '' : null"\r
  [attr.accept]="accept"\r
/>\r
<span class="filename" [title]="fileNames">{{ fileNames }}</span>\r
`,
      styles: [":host{display:inline-block;width:100%}:host:not(.file-input-disabled){cursor:pointer}input{width:0px;height:0px;opacity:0;overflow:hidden;position:absolute;z-index:-1}.filename{display:inline-block;text-overflow:ellipsis;overflow:hidden;width:100%}\n"]
    }]
  }], () => [{
    type: FocusMonitor
  }, {
    type: ElementRef
  }, {
    type: Renderer2
  }, {
    type: ErrorStateMatcher
  }, {
    type: NgControl,
    decorators: [{
      type: Optional
    }, {
      type: Self
    }]
  }, {
    type: NgForm,
    decorators: [{
      type: Optional
    }]
  }, {
    type: FormGroupDirective,
    decorators: [{
      type: Optional
    }]
  }], {
    autofilled: [{
      type: Input
    }],
    valuePlaceholder: [{
      type: Input
    }],
    accept: [{
      type: Input
    }],
    errorStateMatcher: [{
      type: Input
    }],
    defaultIconBase64: [{
      type: Input
    }],
    id: [{
      type: HostBinding
    }],
    describedBy: [{
      type: HostBinding,
      args: ["attr.aria-describedby"]
    }],
    value: [{
      type: Input
    }],
    multiple: [{
      type: Input
    }],
    placeholder: [{
      type: Input
    }],
    shouldLabelFloat: [{
      type: HostBinding,
      args: ["class.mat-form-field-should-float"]
    }],
    required: [{
      type: Input
    }],
    isDisabled: [{
      type: HostBinding,
      args: ["class.file-input-disabled"]
    }],
    disabled: [{
      type: Input
    }],
    change: [{
      type: HostListener,
      args: ["change", ["$event"]]
    }],
    blur: [{
      type: HostListener,
      args: ["focusout"]
    }]
  });
})();
var NGX_MAT_FILE_INPUT_CONFIG = new InjectionToken("ngx-mat-file-input.config");
var ByteFormatPipe = class _ByteFormatPipe {
  constructor(config) {
    this.config = config;
    this.unit = config ? config.sizeUnit : "Byte";
  }
  transform(value, args) {
    if (parseInt(value, 10) >= 0) {
      value = this.formatBytes(+value, +args);
    }
    return value;
  }
  formatBytes(bytes, decimals) {
    if (bytes === 0) {
      return "0 " + this.unit;
    }
    const B = this.unit.charAt(0);
    const k = 1024;
    const dm = decimals || 2;
    const sizes = [this.unit, "K" + B, "M" + B, "G" + B, "T" + B, "P" + B, "E" + B, "Z" + B, "Y" + B];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  static {
    this.ɵfac = function ByteFormatPipe_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _ByteFormatPipe)(ɵɵdirectiveInject(NGX_MAT_FILE_INPUT_CONFIG, 24));
    };
  }
  static {
    this.ɵpipe = ɵɵdefinePipe({
      name: "byteFormat",
      type: _ByteFormatPipe,
      pure: true,
      standalone: false
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ByteFormatPipe, [{
    type: Pipe,
    args: [{
      name: "byteFormat",
      standalone: false
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [NGX_MAT_FILE_INPUT_CONFIG]
    }]
  }], null);
})();
var MaterialFileInputModule = class _MaterialFileInputModule {
  static {
    this.ɵfac = function MaterialFileInputModule_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || _MaterialFileInputModule)();
    };
  }
  static {
    this.ɵmod = ɵɵdefineNgModule({
      type: _MaterialFileInputModule,
      declarations: [FileInputComponent, ByteFormatPipe],
      exports: [FileInputComponent, ByteFormatPipe]
    });
  }
  static {
    this.ɵinj = ɵɵdefineInjector({
      providers: [FocusMonitor, ErrorStateMatcher]
    });
  }
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(MaterialFileInputModule, [{
    type: NgModule,
    args: [{
      declarations: [FileInputComponent, ByteFormatPipe],
      providers: [FocusMonitor, ErrorStateMatcher],
      exports: [FileInputComponent, ByteFormatPipe]
    }]
  }], null, null);
})();
var FileValidator = class {
  /**
   * Function to control content of files
   *
   * @param bytes max number of bytes allowed
   *
   * @returns
   */
  static maxContentSize(bytes) {
    return (control) => {
      const size = control && control.value ? control.value.files.map((f) => f.size).reduce((acc, i) => acc + i, 0) : 0;
      const condition = bytes >= size;
      return condition ? null : {
        maxContentSize: {
          actualSize: size,
          maxSize: bytes
        }
      };
    };
  }
  /**
   * Validator function to validate accepted file formats
   *
   * @param acceptedMimeTypes Array of accepted MIME types (e.g., ['image/jpeg', 'application/pdf'])
   * @returns Validator function
   */
  static acceptedMimeTypes(acceptedMimeTypes) {
    return (control) => {
      const files = control.value ? control.value.files : [];
      const invalidFiles = files.filter((file) => !acceptedMimeTypes.includes(file.type));
      if (invalidFiles.length > 0) {
        return {
          acceptedMimeTypes: {
            validTypes: acceptedMimeTypes
          }
        };
      }
      return null;
    };
  }
};
export {
  ByteFormatPipe,
  FileInput,
  FileInputComponent,
  FileValidator,
  MaterialFileInputModule,
  NGX_MAT_FILE_INPUT_CONFIG
};
//# sourceMappingURL=ngx-custom-material-file-input.js.map
