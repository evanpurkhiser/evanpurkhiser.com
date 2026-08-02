export default function Home() {
  return (
    <main>
      <header className="intro">
        <h1>Evan Purkhiser</h1>
        <p>
          Engineer by profession. Builder by nature. Interested in every layer of a
          product, from systems architecture to the smallest interaction details.
        </p>
      </header>

      <section className="currently" aria-labelledby="currently-heading">
        <h2 id="currently-heading">Currently</h2>
        <p>
          9 years at <a href="https://sentry.io">sentry.io</a>. 6,121 commits.
        </p>
      </section>
    </main>
  );
}
