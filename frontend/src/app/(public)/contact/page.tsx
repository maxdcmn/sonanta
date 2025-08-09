import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 pb-20 text-center">
      <p>Interested in how this project came to be and want to keep in touch?</p>
      <p className="flex gap-4 font-mono text-sm">
        <Link
          className="text-foreground hover:underline hover:underline-offset-4"
          href="https://github.com/maxdcmn"
        >
          maxdcmn
        </Link>
        <Link
          className="text-foreground hover:underline hover:underline-offset-4"
          href="https://github.com/adrianxsusec"
        >
          adrianxsusec
        </Link>
      </p>
    </div>
  );
}
