import { httpGetPromise } from '../../helpers/http';
import createRouter from 'koa-router';
import config from '../../../config';

const router = createRouter();
// ------------------------------------
// Processing request to API
// ------------------------------------

// Get documents from JSON file
router.get(`${config.get('project_public_path')}/api/getDocuments`, function* getDocuments() {
  const documentsJSON = yield httpGetPromise({
    src: 'http://tomcat-bystrobank.rhcloud.com/jparestresource/web/documents',
  });
  const documents = JSON.parse(documentsJSON);
  const documentsSorted = documents.documents.document.sort((a, b) => {
    const aDate = new Date(a.docDate);
    const bDate = new Date(b.docDate);
    if (aDate > bDate) {
      return -1;
    }
    if (aDate < bDate) {
      return 1;
    }
    return 0;
  });
  this.type = 'application/json; charset=utf-8';
  this.body = documentsSorted;
});

export default router;
