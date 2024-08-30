import { createRouteHandler } from "uploadthing/next";
import { chatFileRouter } from '../../uploadthing';

const handler = createRouteHandler({ router: chatFileRouter });

export { handler as default };
