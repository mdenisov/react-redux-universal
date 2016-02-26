import { readFilePromise, writeFilePromise } from '../../../helpers/fs';
import path from 'path';

// Handler form AddDocument
export default function* ({ requestFromFetchAPI }) {
  const documentsJSON = yield readFilePromise(path.join(__dirname, '../../api', 'documents.json'));
  const documents = JSON.parse(documentsJSON);
  const maxID = parseInt(documents.documents.document[documents.documents.document.length - 1].id, 10);
  const curDate = new Date();
  documents.documents.document.push({
    id: (maxID + 1),
    displayName: this.request.body.nameDocument,
    docDate: `${curDate.getUTCFullYear()}-${`0${curDate.getUTCMonth() + 1}`.substr(-2)}-${`0${curDate.getUTCDate()}`.substr(-2)}`,
  });
  const saveData = JSON.stringify(documents);
  yield writeFilePromise(path.join(__dirname, '../../api', 'documents.json'), saveData);
  if (!requestFromFetchAPI) {
    this.redirect('/');
  } else {
    this.body = '';
  }
}
