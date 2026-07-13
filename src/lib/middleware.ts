import { NextResponse } from 'next/server';
import { verifySession } from './auth';

type ExtendedContext = {
  params: Record<string, string>;
  userId: string;
  role: string;
};

type Handler = (
  req: Request,
  context: ExtendedContext
) => Promise<NextResponse>;

export function withAuth(handler: Handler) {
  return async (req: Request, { params }: { params: Record<string, string> }) => {
    try {
      const session = await verifySession();
      if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const context: ExtendedContext = { params, userId: session.userId, role: session.role };
      return handler(req, context);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}

export function withAdmin(handler: Handler) {
  return async (req: Request, { params }: { params: Record<string, string> }) => {
    try {
      const session = await verifySession();
      if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const context: ExtendedContext = { params, userId: session.userId, role: session.role };
      return handler(req, context);
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  };
}
