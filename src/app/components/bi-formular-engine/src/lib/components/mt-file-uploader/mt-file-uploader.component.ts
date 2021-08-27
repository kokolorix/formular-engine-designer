import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FileUploader } from 'ng2-file-upload';
import { EFormularDokumentPoolDTO, EFormularDTO } from 'src/app/api';
import { EFormularBeilageDTO } from 'src/app/api/model/eFormularBeilageDTO';
import { getDateiNamePrint } from 'src/app/services';
import { MtBaseComponent } from '../../base/mt-base/mt-base.component';

interface FileNameProps {
  originalName: string
  longName: string
  shortName: string
}

@Component({
  selector: 'mt-file-uploader',
  templateUrl: './mt-file-uploader.component.html',
  styleUrls: ['./mt-file-uploader.component.scss']
})
export class MtFileUploaderComponent extends MtBaseComponent implements OnInit, OnChanges, OnDestroy {
  uploaderdd: FileUploader = new FileUploader({});
  uploader: FileUploader = new FileUploader({});
  @ViewChild('fileInput') fileInput: any;
  beilage: EFormularBeilageDTO 
  formular: EFormularDTO
  isAttached: boolean
  fnp: FileNameProps
  linkBeilageEventRegistered = false

 

  clr_primary = '#348e7a'
  clr_grau = '#dde1e5'
  saving: boolean;

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.comp.fileUploaderProps.projektService.unRegisterLinkBeilage(this.onLinkBeilage)
  }

  
  
  ngOnChanges() {
    if (!this.comp.fileUploaderProps) return
    const props = this.comp.fileUploaderProps
    this.formular = this.comp.fileUploaderProps.formular
    if (!this.formular) return
    this.beilage = null
    this.fnp = null
    if (this.formular && this.formular.dokument && !props.hideLink) {
      if (props.uploadType === 'Formular') {
        if (this.formular.dokument.originalName && this.formular.formularTyp) {
          this.fnp = {
            originalName: getDateiNamePrint(this.beilage.dokument.originalName),
            longName: this.formular.formularTyp.longName,
            shortName: this.formular.formularTyp.shortName,
          }
        }
      } else if (props.uploadType === 'Beilage') {
        const dokumentPool: EFormularDokumentPoolDTO = props.formular?.formularDokumentPool?.find(b => b.formularBeilage?.formularTyp.guid === props.formularTypGuid)
        this.beilage = dokumentPool?.formularBeilage
        if (this.beilage && this.beilage.dokument && this.beilage.formularTyp) {
          this.fnp = {
            originalName: getDateiNamePrint(this.beilage.dokument.originalName),
            longName: this.beilage.formularTyp.longName,
            shortName: '',
          }
          this.isAttached = true
        } else if (!this.beilage) {
          const ad = props.projekt.auftrag?.dokumente?.find(d => d.eformularBeilagen_IdFormularBeilagen?.formularTyp?.guid === props.formularTypGuid)
          if (ad) {
            this.beilage = ad.eformularBeilagen_IdFormularBeilagen
            this.fnp = {
              originalName: getDateiNamePrint(this.beilage.dokument.originalName),
              longName: this.beilage.formularTyp.longName,
              shortName: '',
            }
          } else {
            this.beilage = null
          }
        }
        if (!this.linkBeilageEventRegistered) {
          this.comp.fileUploaderProps.projektService.registerLinkBeilage(this.onLinkBeilage)
          this.linkBeilageEventRegistered = true
        }
      }
    }
  }

  onFileSelected() {
    if (this.uploader.queue && this.uploader.queue.length > 0) {
      this.uploadFile(this.uploader.queue[0]._file)
      this.uploader.queue[0].remove()
      this.fileInput.nativeElement.value = '';
    }
  }

  onFileDropped(file: File[]) {
    if (file && file.length > 0) {
      this.uploadFile(file[0])
      this.uploaderdd.queue[0].remove()
    }
  }

  getAllowedFileType(): string {
    return this.comp.fileUploaderProps.documentTypes.map(e => '.' + e).join(', ')
  }

  uploadFile(file: File) {
    let error = ''
    const seterror = (err: string) => `uploadFile: ${err} nicht definiert!`
    const props = this.comp.fileUploaderProps
    if (!props.projekt) error = seterror('projekt')
    if (!props.aktion) error = seterror('aktion')
    if (!props.formular) error = seterror('formular')
    if (!props.formularTypGuid) error = seterror('formularTypGuid')
    if (!props.projektService) error = seterror('projektService')
    if (error !== '') return

    const extension = file.name.split('.').pop();

    const d = props.documentTypes as string[]
    const ind = d.indexOf(extension)

    if (ind === -1) {
      alert('Datei-Typ nicht erlaubt.')
      return
    }
    if (props.projektService) {
      this.saving = true
      if (props.uploadType === 'Formular') {
        props.projektService.SavePDF_as_Formular(file, props.formular.guid, props.aktion.guid, props.formularTypGuid).then(data => {
          this.saving = false
          props.projektService.emitReloadFormular()          
        }).catch(err => {
          this.saving = false
        })
      } else if (props.uploadType === 'Beilage') {
        props.projektService.SavePDF_as_Beilage(file, props.projekt.auftrag?.guid, props.formular.guid, props.formularTypGuid).then(data => {
          // if (this.comp.fileUploaderProps.onUploaded) this.comp.fileUploaderProps.onUploaded(this.sm, this.comp, file)
          this.saving = false
          props.projektService.emitReloadFormular()          
        }).catch(err => {
          this.saving = false
        })
      }
    }
  }

  clickZone() {
    this.fileInput.nativeElement.click()
  }

  onPDFClick() {
    const props = this.comp.fileUploaderProps
    let guid = null
    if (props.uploadType === 'Formular') {
      guid = props.formular.dokument.guid
    } else if (props.uploadType === 'Beilage') {
      guid = this.beilage && this.beilage.dokument ? this.beilage.dokument.guid : null
    }
    if (guid) {
      props.projektService.curFormular = this.formular
      props.router.navigate(['/pdf-viewer'], { queryParams: { guid, typ: props.formularTypGuid, guidauftrag: props.projekt.auftrag.guid, aktion: props.aktion.guid } });
    }
  }

  changeBeilageAttached(event: any) {
    const formularDokumentPool: EFormularDokumentPoolDTO  = {
      guidFormular: this.formular.guid,
      guidFormularBeilagen: this.beilage.guid,
    }
    this.comp.fileUploaderProps.projektService.Insert_Remove_FormularDokumentPool(event.checked, formularDokumentPool)
    this.isAttached = event.checked
  }


  onLinkBeilage = (formularPool: EFormularDokumentPoolDTO) => {
    if (formularPool?.formularBeilage?.guid === this.beilage?.guid) {
      this.isAttached = !formularPool.linkRemoved 
    }
  }

  getBackground(): string {
    return `flex mat-elevation-z1 outline-none p-4 mb-4 bg-white`
  }

  getVerknuepfenText(): string {
    return this.isAttached ? 'verknüpft' : 'verknüpfen'
  }


}
