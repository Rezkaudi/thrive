export interface IKeyword {
  id: string;
  lessonId: string;
  englishText: string;
  japaneseText: string;
  englishSentence: string;
  japaneseSentence: string;
  englishAudioUrl?: string;
  japaneseAudioUrl?: string;
  japaneseSentenceAudioUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export class Keyword implements IKeyword {
  constructor(
    public id: string,
    public lessonId: string,
    public englishText: string,
    public japaneseText: string,
    public englishSentence: string,
    public japaneseSentence: string,
    public englishAudioUrl: string | undefined,
    public japaneseAudioUrl: string | undefined,
    public japaneseSentenceAudioUrl: string | undefined,
    public order: number,
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}