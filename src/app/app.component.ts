import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
})
export class AppComponent {
  constructor(private translate: TranslateService) {
    const savedLang = localStorage.getItem('lang'); 

    this.translate.addLangs(['fr', 'en']);
    this.translate.setDefaultLang('fr');

    if (savedLang && ['fr', 'en'].includes(savedLang)) {
      this.translate.use(savedLang);
    } else {
      this.translate.use('fr'); 
    }
  }

  changeLang(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang); 
  }
}
