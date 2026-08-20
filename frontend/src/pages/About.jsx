import { useState } from 'react'
import './About.css'

const team = [
  {
    name: 'Priya Nair',
    role: 'Founder & recipe tester',
    bio: 'Started Tasty Table out of a shared Google Doc of family recipes. Cannot be trusted around a bag of good tomatoes.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
  },
  {
    name: 'Daniel Cho',
    role: 'Recipes editor',
    bio: 'Formerly a line cook, now translates restaurant technique into recipes that work in a normal kitchen.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
  },
  {
    name: 'Elena Marsh',
    role: 'Baking lead',
    bio: 'Measures everything in grams and will not apologize for it. Runs the Sunday baking column.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
  },
]

const faqs = [
  {
    q: 'Are the recipes actually tested?',
    a: 'Yes. Every recipe on Tasty Table is cooked at least twice by someone on our team before it goes live, once exactly as written and once with common substitutions.',
  },
  {
    q: 'Can I submit my own recipe?',
    a: "Absolutely. Head to the Share a recipe page and fill in the form. We read every submission and follow up if we'd like to feature it.",
  },
  {
    q: 'Do you save my favorites if I clear my browser?',
    a: 'Saved recipes are stored on your device, so clearing site data or switching browsers will reset your box.',
  },
]

export default function About() {
  const [openFaq, setOpenFaq] = useState(0)
  const [formState, setFormState] = useState({ name: '', email: '', message: '' })
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <span className="eyebrow">Our story</span>
          <h1>A recipe box, made public</h1>
          <p className="about-lede">
            Tasty Table started as a shared folder between three friends who
            kept texting each other the same three recipes. We decided other
            people might want them too, and built a place to keep testing and
            adding more.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container about-mission">
          <div>
            <span className="eyebrow">What we believe</span>
            <h2>Recipes should be honest</h2>
            <p>
              No recipe goes up until someone on our team has cooked it in a
              regular kitchen, with regular equipment, and written down what
              actually happened &mdash; including the part where the sauce
              split the first time. We would rather a recipe be useful than
              impressive.
            </p>
          </div>
          <div>
            <span className="eyebrow">What we're building</span>
            <h2>A box that grows with you</h2>
            <p>
              Every recipe you save stays in your personal box, and every
              recipe you submit helps someone else's Tuesday night dinner. The
              goal is a collection that gets better because people actually
              use it.
            </p>
          </div>
        </div>
      </section>

      <section className="section-tight team-section">
        <div className="container">
          <span className="eyebrow">The team</span>
          <h2>Who's cooking</h2>
          <div className="team-grid">
            {team.map((person) => (
              <div key={person.name} className="team-card">
                <img src={person.image} alt={person.name} />
                <h3>{person.name}</h3>
                <p className="team-role">{person.role}</p>
                <p className="team-bio">{person.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section faq-section">
        <div className="container faq-grid">
          <div>
            <span className="eyebrow">Questions</span>
            <h2>Frequently asked</h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={faq.q} className="faq-item">
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  aria-expanded={openFaq === i}
                >
                  {faq.q}
                  <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="faq-answer">{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="section-tight contact-section">
        <div className="container contact-grid">
          <div>
            <span className="eyebrow">Get in touch</span>
            <h2>Say hello</h2>
            <p>
              Questions, feedback, or a recipe idea you want us to test?
              Send it over and we'll get back to you.
            </p>
          </div>

          {submitted ? (
            <div className="contact-success">
              <h3>Message sent</h3>
              <p>Thanks for reaching out &mdash; we'll reply within a couple of days.</p>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit}>
              <label>
                Name
                <input
                  type="text"
                  required
                  value={formState.name}
                  onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                  placeholder="Your name"
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  required
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                Message
                <textarea
                  required
                  rows={4}
                  value={formState.message}
                  onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                  placeholder="What's on your mind?"
                />
              </label>
              <button type="submit" className="btn btn-primary">Send message</button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
