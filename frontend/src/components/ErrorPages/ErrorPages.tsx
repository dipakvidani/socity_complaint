import { Link } from "react-router-dom";

interface ScreenProps {
  code: string;
  title: string;
  message: string;
}

function Screen({ code, title, message }: ScreenProps) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-content flex-col items-center justify-center gap-4 px-page text-center">
      <p className="text-page font-semibold tracking-tight text-primary">{code}</p>
      <h1 className="text-heading font-bold text-ink">{title}</h1>
      <p className="max-w-md text-body text-mute">{message}</p>
      <Link to="/" className="inline-flex h-10 items-center rounded-md bg-primary px-3.5 text-small font-bold text-on-primary">
        Back to home
      </Link>
    </div>
  );
}

export const NotFoundPage = () => (
  <Screen code="404" title="We could not find that page" message="The page may have moved, or the link might be typed wrong." />
);

export const ForbiddenPage = () => (
  <Screen code="403" title="This area is not for you" message="Your account does not have permission to open this page." />
);
