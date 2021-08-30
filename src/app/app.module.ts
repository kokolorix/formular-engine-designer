import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BiFormModuleModule } from 'src/app/components/bi-formular-engine/src/public-api';

@NgModule({
  declarations: [
    AppComponent,
    
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    BiFormModuleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
