import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { LOJA_CONFIG } from './app.tokens';

/** Monta o <title> de cada rota no formato "Página · Vértice Motors". */
@Injectable()
export class TituloStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly loja = inject(LOJA_CONFIG);

  override updateTitle(estado: RouterStateSnapshot): void {
    const titulo = this.buildTitle(estado);
    this.title.setTitle(titulo ? `${titulo} · ${this.loja.nome}` : `${this.loja.nome} — ${this.loja.slogan}`);
  }
}
