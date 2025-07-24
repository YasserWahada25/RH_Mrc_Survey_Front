// src/app/app.module.ts

import { NgModule }                from '@angular/core';
import { BrowserModule }           from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule }            from '@angular/router';
import { HttpClientModule }        from '@angular/common/http';

import { AppComponent }            from './app.component';           // standalone
import { routes }                  from './app.routes';             // vos routes

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(routes),
    AppComponent                                       // importer le composant standalone
  ],
  providers: [],
  bootstrap: [AppComponent]                             // le démarrer
})
export class AppModule {}
