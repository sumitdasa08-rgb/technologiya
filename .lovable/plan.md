
Goal: remove the unreliable “Choose a service” dropdown and redesign the booking flow so service selection happens in the first step (with date/time), then user moves to details (name/phone/email/issue), then booking/payment flow continues as it does now.

Implementation approach

1) Restructure step 1 to include service selection
- File: `src/components/BookingSection.tsx`
- Keep current multi-step flow (`datetime` → `details`) but move service picking into `datetime`.
- Add a dedicated “Choose Service” section in the first step UI (below calendar/time area, or as a full-width section under that row so it has enough space for all 8 services).
- Use a stable inline UI instead of Radix Select:
  - Preferred: radio-card list (using existing `RadioGroup` / `RadioGroupItem`) with each row/card showing service name + price.
  - Alternative equivalent: plain button list with selected state.
- Make each service option clearly clickable and visibly selected.

2) Remove dropdown from details step
- File: `src/components/BookingSection.tsx`
- Delete the current Select-based block in details step:
  - `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`.
- Keep service price visible in details step as read-only summary (selected from step 1), so user still sees what they are booking and amount before submit.

3) Update validation and navigation gating
- File: `src/components/BookingSection.tsx`
- Update `handleDateTimeNext` validation:
  - Require `selectedDate`, `selectedTime`, and `selectedService`.
  - Show clear toast message if any missing (e.g. “Please select date, time, and service”).
- Update “Continue” button disabled state to require all three selections.
- Keep `handleSubmit` validation as safety check (still validates service before create-booking call).

4) Keep backend flow unchanged (no database changes)
- No backend schema or policy updates required.
- Existing booking function already securely validates service and computes amount server-side.
- Existing `service_pricing` data is already present (8 active services), so this is purely a frontend interaction fix.

5) Mobile behavior polish
- Ensure service list in step 1 is mobile-friendly:
  - vertical stack, adequate touch targets, visible selected state.
- Preserve current mobile time-collapse behavior, but do not hide service section when time collapses.
- Ensure user can still select/change service before moving forward.

6) Clean imports and dead UI references
- File: `src/components/BookingSection.tsx`
- Remove Select imports after replacing dropdown UI.
- Add radio-group import if using `RadioGroup`.
- Keep `selectedService` computed value and reuse it in summary + button label.

Testing plan (end-to-end)
1. Open booking section.
2. In step 1, select:
   - date
   - time
   - service (from new radio-card list)
3. Confirm Continue only enables when all 3 are selected.
4. Move to details step and verify:
   - selected date/time summary is correct
   - selected service and charge are shown correctly
5. Enter name + phone and submit.
6. Confirm redirect to status page and booking is created with correct `service_id` and amount.
7. Repeat on mobile viewport to verify touch selection and step progression.

Technical notes
- This intentionally avoids dropdown/portal layering issues entirely by removing service selection dependence on popper overlays.
- No change needed in `src/components/ui/select.tsx` for this fix path, because booking flow no longer relies on that component.
- Scope is focused to `BookingSection.tsx` unless tiny styling helpers are needed.
