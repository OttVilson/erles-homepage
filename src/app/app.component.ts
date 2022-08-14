import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable, shareReplay, tap } from 'rxjs';

export type Piece = {
  composer: string,
  title: string,
  tags: string[]
}

const reducer = (divided: Record<string, Piece[]>, piece: Piece): Record<string, Piece[]> =>
  {
    piece.tags.forEach(tag => {
      divided[tag] = divided[tag] ?? [];
      divided[tag].push(piece)
    })
    return divided;
  }

const toEntries = (divided: Record<string, Piece[]>): {tag: string, pieces: Piece[]}[] => {
  let entries = [];
  for (let key in divided) {
    entries.push({ tag: key, pieces: divided[key]})
  }
  return entries;
} 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  pieces$: Observable<Piece[]>;
  divisionByTags$: Observable<{tag: string, pieces: Piece[]}[]>;
  constructor(firestore: AngularFirestore) {
    this.pieces$ = firestore.collection<Piece>('pieces').valueChanges().pipe(shareReplay());
    this.divisionByTags$ = this.pieces$.pipe(
      map(arr => arr.reduce(reducer, {})),
//      tap(console.log),
      map(toEntries),
//      tap(console.log)
    );
  }
}
