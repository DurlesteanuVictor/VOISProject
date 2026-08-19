# FixFlex — Project Documentation

## 1. Overview

FixFlex is a web platform that connects drivers with local auto repair services. Users can browse available auto services, check ratings and pricing, and book an appointment. Auto repair businesses can register on the platform and manage the mechanics working for them.

**Target users:**

- **Clients** — drivers looking for a trustworthy, convenient way to book car repairs
- **Companies** — auto repair businesses that register on the platform and manage the mechanics working under their account

---

## 2. High-Level Architecture

```
|--------------------------------------------------------------------------------------------------------|
|Frontend (HTML / CSS / JS)  <-- HTTP/JSON -->  Backend (Python, FastAPI)  <-- SQL -->  Database (SQLite)| <---->  security (JWT)
|--------------------------------------------------------------------------------------------------------|

```

---

## 3. Requirements / Backlog

### Must have

- Users can register and log in to an account, as a Client or as a Company
- Companies can add and manage the mechanics working under them
- Clients can browse companies by servises
- Clients can view details about a service (rating, price, location, description)
- Clients can start a booking (select date, time, and their car)
- Clients can add and remove multiple cars from their profile

### Should have

- Users can view and edit their profile information
- Users can change their password
- Clear error and success feedback throughout all forms (no silent failures)
- Location-based search (choose an area on a map, set a search radius)
- Booking history on the user's profile
- Real profile picture storage/upload

### Won't have (for now)

- Real online payment processing
- Automatic filtering of companies by distance from the selected location — the location map is implemented and fully functional as a visual tool (pick a point, set a search radius, save it), but it isn't yet connected to actually filtering the results
- Support for service categories beyond car mechanics
- Reviews / comments on companies
- Dynamic pricing

---

## 4. Risk Register

| #   | Risk                                                                                             | Impact | Likelihood | Fix                                                                                                                                |
| --- | ------------------------------------------------------------------------------------------------ | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The database (SQLite) is not built for many simultaneous users — it locks on concurrent writes   | Medium | Low        | Migrating to a more robust database such as MySQL would be the fix if usage grows                                                  |
| 2   | A team member falls behind on their part of the work                                             | Medium | Low        | Daily check-ins on progress make delays visible early, so tasks can be redistributed in time                                       |
| 3   | A last-minute bug appears during the live demo presentation                                      | Medium | Low        | Regular QA checks on the whole site, plus testing each feature individually as it's built                                          |
| 4   | A team member becomes unavailable and their part of the project is not well understood by others | Medium | Low        | Code is kept in a shared repository with incremental commits, so any change is traceable and reviewable by the rest of the team    |
| 5   | SQL injection — malicious input used to manipulate database queries                              | High   | Low        | The backend uses SQLAlchemy's query builder rather than raw SQL, which parameterizes inputs and protects against this by default   |
| 6   | DDoS — the server is overwhelmed by a flood of requests                                          | Medium | Low        | Not a priority at this project's current scale; would need rate-limiting / hosting-level protection if the app moves to production |
