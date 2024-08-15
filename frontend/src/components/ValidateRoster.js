import { A } from "@solidjs/router";
import clsx from "clsx";
import { Icon } from "solid-heroicons";
import {
  creditCard,
  currencyRupee,
  document,
  documentCheck,
  handThumbDown,
  handThumbUp,
  noSymbol,
  shieldCheck,
  shieldExclamation,
  videoCamera,
  xCircle
} from "solid-heroicons/solid-mini";
import { createEffect, createSignal, For, Match, Show, Switch } from "solid-js";
import { onMount } from "solid-js";

import { accreditationChoices, matchUpChoices, minAge } from "../constants";
import { useStore } from "../store";
import { fetchUrl, getAge, getLabel } from "../utils";
import AccreditationInformation from "./AccreditationInformation";
import CollegeIDInformation from "./CollegeIDInformation";
import Modal from "./Modal";

const groupByTeam = registrations => {
  const teamsMap = registrations?.reduce(
    (acc, r) => ({ ...acc, [r.team.id]: r.team }),
    {}
  );
  const teams = Object.values(teamsMap || {}).sort((a, b) =>
    a.name.toLowerCase() == b.name.toLowerCase()
      ? 0
      : a.name.toLowerCase() < b.name.toLowerCase()
      ? -1
      : 1
  );
  const registrationsByTeam = registrations?.reduce((acc, r) => {
    const team = acc[r.team.id] || [];
    return { ...acc, [r.team.id]: [...team, r] };
  }, {});
  return { teams, registrationsByTeam };
};

const isPlayer = registration => {
  return registration?.is_playing;
};

const isCaptain = registration => {
  return registration?.role === "CAP";
};

const isSpiritCaptain = registration => {
  return registration?.role === "SCAP";
};

const isNonPlayer = registration => {
  return !registration?.is_playing;
};

const ValidationLegend = () => (
  <ul class="w-80 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
    <li class="w-full rounded-t-lg border-b border-gray-200 px-4 py-2 dark:border-gray-600">
      <Icon
        path={noSymbol}
        style={{
          width: "20px",
          display: "inline"
        }}
      />{" "}
      — Ultimate Central profile not linked to the Hub
    </li>
    <li class="w-full border-b border-gray-200 px-4 py-2 dark:border-gray-600">
      <Icon
        path={currencyRupee}
        style={{
          width: "20px",
          display: "inline"
        }}
      />
      — Membership Fee status
    </li>
    <li class="w-full border-b border-gray-200 px-4 py-2 dark:border-gray-600">
      <Icon
        path={handThumbUp}
        style={{
          width: "20px",
          display: "inline"
        }}
      />{" "}
      — Liability Waiver Signed
    </li>
    <li class="w-full border-b border-gray-200 px-4 py-2 dark:border-gray-600">
      <Icon
        path={handThumbDown}
        style={{
          width: "20px",
          display: "inline"
        }}
      />{" "}
      — Liability Waiver Not Signed
    </li>
    <li class="w-full border-b border-gray-200 px-4 py-2 dark:border-gray-600">
      <Icon
        path={shieldCheck}
        style={{
          width: "20px",
          display: "inline"
        }}
      />{" "}
      — Player Vaccinated
    </li>
    <li class="w-full border-b border-gray-200 px-4 py-2 dark:border-gray-600">
      <Icon
        path={shieldExclamation}
        style={{
          width: "20px",
          display: "inline"
        }}
      />{" "}
      — Player Not Vaccinated
    </li>
    <li class="w-full border-b border-gray-200 px-4 py-2 dark:border-gray-600">
      <Icon
        path={documentCheck}
        style={{
          width: "20px",
          display: "inline"
        }}
      />{" "}
      — Advanced Accreditation
    </li>
    <li class="w-full border-b border-gray-200 px-4 py-2 dark:border-gray-600">
      <Icon
        path={document}
        style={{
          width: "20px",
          display: "inline"
        }}
      />{" "}
      — Standard Accreditation
    </li>
    <li class="w-full rounded-b-lg px-4 py-2">
      <Icon
        path={xCircle}
        style={{
          width: "20px",
          display: "inline"
        }}
      />{" "}
      — No Accreditation
    </li>
    <li class="w-full rounded-b-lg px-4 py-2">
      <Icon
        path={videoCamera}
        style={{
          width: "20px",
          display: "inline"
        }}
      />{" "}
      — Commentary Info status
    </li>
  </ul>
);

const ValidateRoster = () => {
  const [store] = useStore();
  const [event, setEvent] = createSignal();
  const [eventData, setEventData] = createSignal();
  const [events, setEvents] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [status, setStatus] = createSignal("");

  const eventsSuccessHandler = async response => {
    let data;
    setLoading(false);
    if (response.ok) {
      data = await response.json();
      setEvents(data.sort((a, b) => a.event.start_date < b.event.start_date));
      setEvent(data[0]);
    } else {
      data = await response.text();
      console.log(data);
    }
  };

  const eventDataFetched = async response => {
    setLoading(false);
    if (response.ok) {
      const registrations = await response.json();
      const groupedData = groupByTeam(registrations);
      setEventData({ ...event(), ...groupedData });
      console.log({ ...event(), ...groupedData });
    } else {
      if (response.status / 100 === 4) {
        const responseBody = await response.json();
        setStatus(responseBody.message);
      } else {
        setStatus(`Error: ${response.statusText}`);
      }
    }
  };

  const handleEventChange = e => {
    setEvent(events().find(ev => ev.id === Number(e.target.value)));
  };

  onMount(() => {
    console.log("Fetching events info...");
    setLoading(true);
    fetchUrl("/api/tournaments", eventsSuccessHandler, error => {
      console.log(error);
      setLoading(false);
    });
  });

  createEffect(() => {
    if (event()?.id) {
      const tournamentId = event()?.id;
      setLoading(true);
      setStatus("");
      fetchUrl(
        `/api/registrations/tournament/${tournamentId}`,
        eventDataFetched,
        error => {
          console.log(error);
          setLoading(false);
        }
      );
    }
  });

  const greenText = "text-green-600 dark:text-green-500";
  const redText = "text-red-600 dark:text-red-500";

  const today = new Date().toISOString().split("T")[0];

  const playerAccreditationValid = player => {
    if (!player?.accreditation?.is_valid) {
      return false;
    }
    if (!event()) {
      return player?.accreditation?.is_valid;
    }
    let lastValid = new Date(event()?.end_date);
    lastValid.setMonth(lastValid.getMonth() - 18); // 18 months validity for accreditations
    return new Date(player?.accreditation?.date) > lastValid;
  };

  const membershipValidForEvent = player => {
    if (!player?.membership?.is_active) {
      return false;
    }
    if (!event()) {
      return player?.membership?.is_active;
    }
    const eventStart = new Date(event()?.start_date);
    const eventEnd = new Date(event()?.end_date);

    const membershipStart = new Date(player.membership.start_date);
    const membershipEnd = new Date(player.membership.end_date);

    return membershipStart <= eventStart && membershipEnd >= eventEnd;
  };

  return (
    <div>
      <div class="mb-12">
        <h2
          class="text-2xl font-bold text-red-500"
          id="accordion-collapse-heading-1"
        >
          Select Event
        </h2>
        <select
          id="event"
          class="my-4 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
          value={event()?.id}
          onInput={handleEventChange}
          required
        >
          <option value="" placeholder disabled>
            Select event
          </option>
          <For each={events()?.filter(e => e.event.end_date >= today)}>
            {event => <option value={event?.id}>{event?.event?.title}</option>}
          </For>
          <option value="" placeholder disabled>
            Past events
          </option>
          <For each={events()?.filter(e => e.event.end_date < today)}>
            {event => <option value={event?.id}>{event?.event?.title}</option>}
          </For>
        </select>
      </div>
      <Switch>
        <Match when={loading()}>
          <p>Fetching event information ...</p>
        </Match>
        <Match when={!loading() && !eventData() && status()}>
          <div
            class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
            role="alert"
          >
            {status()}
          </div>
          <Switch>
            <Match when={!store?.data?.player?.id && !store?.data?.is_staff}>
              You need to{" "}
              <A
                class="text-blue-500 hover:text-blue-700 dark:text-blue-600 dark:hover:text-blue-400"
                href="/registration/me"
              >
                register yourself
              </A>{" "}
              as a player and link your Ultimate Central profile to validate
              your team's roster.
            </Match>
            <Match
              when={
                !store?.data?.player?.ultimate_central_id &&
                !store?.data?.is_staff
              }
            >
              You need to{" "}
              <A
                class="text-blue-500 hover:text-blue-700 dark:text-blue-600 dark:hover:text-blue-400"
                href={`/uc-login/${store.data.player.id}`}
              >
                link your Ultimate Central
              </A>{" "}
              profile from here.
            </Match>
          </Switch>
        </Match>
        <Match when={eventData()?.event?.slug}>
          <h2 class="text-2xl font-bold text-blue-500">
            {eventData()?.event?.title}
          </h2>
          <h3 class="font-bold">
            No. of Teams - {(eventData()?.teams || []).length}
          </h3>
          {/* <a
            href={`https://indiaultimate.org/en_in/e/${
              eventData()?.ultimate_central_slug
            }`}
          >
            View event on Ultimate Central
          </a> */}
          <Show when={(eventData()?.teams || []).length === 0}>
            <div
              class="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
              role="alert"
            >
              No teams have registered for this event yet!
            </div>
          </Show>
          <div class="my-4 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <For each={eventData()?.teams}>
              {team => {
                const teamRegistrations = eventData()?.registrationsByTeam[
                  team.id
                ].filter(r => isPlayer(r));
                const matchUps =
                  teamRegistrations.filter(r => !r.player).length > 0
                    ? [...matchUpChoices, { label: "Unknown" }]
                    : matchUpChoices;

                const teamNonPlayersRegistrations =
                  eventData()?.registrationsByTeam[team.id].filter(r =>
                    isNonPlayer(r)
                  );
                return (
                  <div>
                    <h3 class="text-xl font-bold text-blue-500">
                      {team.name} ({teamRegistrations.length})
                    </h3>
                    <For each={matchUps}>
                      {matchUp => (
                        <>
                          <h4 class="text-l font-bold text-blue-400 dark:text-blue-300">
                            {matchUp.label} (
                            {
                              teamRegistrations.filter(
                                r =>
                                  (!matchUp.value && !r.player) ||
                                  r.player?.match_up === matchUp.value
                              ).length
                            }
                            )
                          </h4>
                          <ul class="w-200 my-4 rounded-lg border border-gray-200 bg-white text-sm font-medium dark:border-gray-600 dark:bg-gray-700 ">
                            <For
                              each={teamRegistrations.filter(
                                r =>
                                  (!matchUp.value && !r.player) ||
                                  r.player?.match_up === matchUp.value
                              )}
                            >
                              {registration => {
                                const age = getAge(
                                  new Date(registration.player?.date_of_birth),
                                  new Date(eventData()?.start_date)
                                );
                                const displayAge = Math.round(age * 100) / 100;
                                const accreditationDate =
                                  registration?.player?.accreditation?.date;
                                const accreditationLevel =
                                  registration?.player?.accreditation?.level;

                                let accreditationModalRef;
                                let collegeIDModalRef;

                                const closeAccreditationModal = () => {
                                  accreditationModalRef.close();
                                };
                                const closeCollegeIDModal = () => {
                                  collegeIDModalRef.close();
                                };
                                return (
                                  <li
                                    class={clsx(
                                      "flex w-full justify-between rounded-t-lg border-b border-gray-200 px-4 py-2 dark:border-gray-600",
                                      displayAge < minAge
                                        ? "bg-gray-100 dark:bg-gray-800"
                                        : ""
                                    )}
                                  >
                                    <div class="truncate">
                                      <span class="text-gray-900 dark:text-white">
                                        {registration.player.full_name}
                                      </span>
                                      <Show when={isCaptain(registration)}>
                                        <span class="text-blue-500"> (C)</span>
                                      </Show>
                                      <Show
                                        when={isSpiritCaptain(registration)}
                                      >
                                        <span class="text-blue-500"> (SC)</span>
                                      </Show>
                                      <br />
                                      <span class="text-xs">
                                        {registration.email}
                                      </span>
                                    </div>

                                    <div>
                                      <Switch>
                                        <Match when={registration?.player}>
                                          <span
                                            title="Membership valid?"
                                            class={clsx(
                                              "mx-1",
                                              membershipValidForEvent(
                                                registration.player
                                              )
                                                ? greenText
                                                : redText
                                            )}
                                          >
                                            <Icon
                                              path={currencyRupee}
                                              style={{
                                                width: "20px",
                                                display: "inline"
                                              }}
                                            />
                                          </span>
                                          <span
                                            title="Liability Waiver signed?"
                                            class={clsx(
                                              "mx-1",
                                              registration.player?.membership
                                                ?.waiver_valid
                                                ? greenText
                                                : redText
                                            )}
                                          >
                                            <Icon
                                              path={
                                                registration.player?.membership
                                                  ?.waiver_valid
                                                  ? handThumbUp
                                                  : handThumbDown
                                              }
                                              style={{
                                                width: "20px",
                                                display: "inline"
                                              }}
                                            />
                                          </span>
                                          <span
                                            title="Vaccinated?"
                                            class={clsx(
                                              "mx-1",
                                              registration.player?.vaccination
                                                ?.is_vaccinated
                                                ? greenText
                                                : redText
                                            )}
                                          >
                                            <Icon
                                              path={
                                                registration.player?.vaccination
                                                  ?.is_vaccinated
                                                  ? shieldCheck
                                                  : shieldExclamation
                                              }
                                              style={{
                                                width: "20px",
                                                display: "inline"
                                              }}
                                            />
                                          </span>
                                          <span
                                            title={`Accreditation - ${
                                              playerAccreditationValid(
                                                registration.player
                                              )
                                                ? `${getLabel(
                                                    accreditationChoices,
                                                    accreditationLevel
                                                  )} (${accreditationDate})`
                                                : !accreditationDate
                                                ? "No accreditation"
                                                : `Outdated: ${accreditationDate}`
                                            }`}
                                            class={clsx(
                                              "mx-1",
                                              playerAccreditationValid(
                                                registration.player
                                              )
                                                ? greenText
                                                : redText
                                            )}
                                          >
                                            <Show
                                              when={playerAccreditationValid(
                                                registration.player
                                              )}
                                              fallback={
                                                <Icon
                                                  path={xCircle}
                                                  style={{
                                                    width: "20px",
                                                    display: "inline"
                                                  }}
                                                />
                                              }
                                            >
                                              <button
                                                onClick={() =>
                                                  accreditationModalRef.showModal()
                                                }
                                              >
                                                <Icon
                                                  path={
                                                    accreditationLevel === "ADV"
                                                      ? documentCheck
                                                      : document
                                                  }
                                                  style={{
                                                    width: "20px",
                                                    display: "inline"
                                                  }}
                                                />
                                              </button>
                                              <Modal
                                                ref={accreditationModalRef}
                                                title={`Accreditation - ${registration.first_name} ${registration.last_name}`}
                                                close={closeAccreditationModal}
                                              >
                                                <AccreditationInformation
                                                  accreditation={
                                                    registration.player
                                                      .accreditation
                                                  }
                                                />
                                              </Modal>
                                            </Show>
                                          </span>
                                          <span
                                            title="Commentary Info updated?"
                                            class={clsx(
                                              "mx-1",
                                              registration?.player
                                                ?.commentary_info
                                                ? greenText
                                                : redText
                                            )}
                                          >
                                            <Icon
                                              path={videoCamera}
                                              style={{
                                                width: "20px",
                                                display: "inline"
                                              }}
                                            />
                                          </span>
                                          <span
                                            title="College ID Card Added?"
                                            class={clsx(
                                              "mx-1",
                                              registration?.player?.college_id
                                                ? greenText
                                                : redText
                                            )}
                                          >
                                            <Show
                                              when={
                                                registration?.player?.college_id
                                              }
                                              fallback={
                                                <Icon
                                                  path={creditCard}
                                                  style={{
                                                    width: "20px",
                                                    display: "inline"
                                                  }}
                                                />
                                              }
                                            >
                                              <button
                                                onClick={() =>
                                                  collegeIDModalRef.showModal()
                                                }
                                              >
                                                <Icon
                                                  path={creditCard}
                                                  style={{
                                                    width: "20px",
                                                    display: "inline"
                                                  }}
                                                />
                                              </button>
                                              <Modal
                                                ref={collegeIDModalRef}
                                                title={`College ID Card - ${registration.first_name} ${registration.last_name}`}
                                                close={closeCollegeIDModal}
                                              >
                                                <CollegeIDInformation
                                                  college_id={
                                                    registration.player
                                                      .college_id
                                                  }
                                                />
                                              </Modal>
                                            </Show>
                                          </span>
                                        </Match>
                                      </Switch>
                                      <Show when={displayAge < minAge}>
                                        <p
                                          class="rounded-lg bg-red-50 text-sm text-red-800 dark:bg-gray-800 dark:text-red-400"
                                          role="alert"
                                        >
                                          Under age: {displayAge} years old
                                        </p>
                                      </Show>
                                    </div>
                                  </li>
                                );
                              }}
                            </For>
                          </ul>
                        </>
                      )}
                    </For>
                    <Show when={teamNonPlayersRegistrations.length > 0}>
                      <h4 class="text-l font-bold text-blue-400 dark:text-blue-300">
                        Non Players
                      </h4>
                      <ul class="w-200 my-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                        <For each={teamNonPlayersRegistrations}>
                          {registration => (
                            <li class="w-full rounded-t-lg border-b border-gray-200 px-4 py-2 dark:border-gray-600">
                              {registration.first_name} {registration.last_name}{" "}
                              <span class="text-blue-500">
                                ({registration.role})
                              </span>
                            </li>
                          )}
                        </For>
                      </ul>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
          <ValidationLegend />
        </Match>
      </Switch>
    </div>
  );
};
export default ValidateRoster;
