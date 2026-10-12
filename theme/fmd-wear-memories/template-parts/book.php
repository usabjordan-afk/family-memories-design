<?php
/**
 * Booking form → admin-post.php (emails the request, keeps a copy in wp-admin → Bookings).
 *
 * @package fmd
 */

// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- display only.
$fmd_status = isset( $_GET['booking'] ) ? sanitize_key( $_GET['booking'] ) : '';
?>
<section class="sec sec--lilac book" id="book" aria-labelledby="book-title">
	<div class="wrap book__grid">
		<header class="sec__head book__head">
			<h2 class="h2" id="book-title">Book us</h2>
			<p class="lede">Tell us about your tournament or team. Directors: include your dates and how many teams you expect.</p>
			<dl class="book__contact">
				<div><dt class="mono">Email</dt><dd><a href="mailto:<?php echo esc_attr( fmd_mod( 'email' ) ); ?>"><?php echo esc_html( fmd_mod( 'email' ) ); ?></a></dd></div>
				<div><dt class="mono">Phone</dt><dd><a href="<?php echo esc_attr( fmd_tel( fmd_mod( 'phone' ) ) ); ?>"><?php echo esc_html( fmd_mod( 'phone' ) ); ?></a></dd></div>
				<div><dt class="mono">Based in</dt><dd><?php echo esc_html( fmd_mod( 'city' ) ); ?></dd></div>
			</dl>
		</header>

		<form class="form" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post" enctype="multipart/form-data" data-booking novalidate>
			<input type="hidden" name="action" value="fmd_book">
			<input type="hidden" name="fmd_ts" value="" data-ts>
			<div class="form__trap" aria-hidden="true">
				<label for="fmd-website">Website</label>
				<input type="text" id="fmd-website" name="website" tabindex="-1" autocomplete="off">
			</div>

			<fieldset class="form__group">
				<legend class="field__label">I am a</legend>
				<div class="seg seg--fill">
					<?php foreach ( fmd_booking_roles() as $fmd_k => $fmd_label ) : ?>
						<label class="seg__opt">
							<input type="radio" name="fmd_role" value="<?php echo esc_attr( $fmd_k ); ?>" id="role-<?php echo esc_attr( $fmd_k ); ?>" <?php checked( 'director', $fmd_k ); ?>>
							<span><?php echo esc_html( $fmd_label ); ?></span>
						</label>
					<?php endforeach; ?>
				</div>
			</fieldset>

			<div class="form__grid">
				<label class="field">
					<span class="field__label">Name</span>
					<input class="field__input" type="text" id="fmd_name" name="fmd_name" autocomplete="name" required>
				</label>
				<label class="field">
					<span class="field__label">Email</span>
					<input class="field__input" type="email" id="fmd_email" name="fmd_email" autocomplete="email" inputmode="email" required>
				</label>
				<label class="field">
					<span class="field__label">Phone <em>optional</em></span>
					<input class="field__input" type="tel" id="fmd_phone" name="fmd_phone" autocomplete="tel" inputmode="tel">
				</label>
				<label class="field">
					<span class="field__label">Tournament or team</span>
					<input class="field__input" type="text" id="fmd_event" name="fmd_event" placeholder="Spring Cup 2027">
				</label>
				<label class="field">
					<span class="field__label">Date(s)</span>
					<input class="field__input" type="text" id="fmd_date" name="fmd_date" placeholder="May 3–4">
				</label>
				<label class="field">
					<span class="field__label">Venue or city</span>
					<input class="field__input" type="text" id="fmd_venue" name="fmd_venue" autocomplete="address-level2">
				</label>
				<label class="field">
					<span class="field__label">Expected players <em>optional</em></span>
					<input class="field__input" type="text" id="fmd_players" name="fmd_players" inputmode="numeric">
				</label>
				<label class="field field--file">
					<span class="field__label">Logo or artwork <em>optional</em></span>
					<input class="field__input" type="file" id="fmd_logo" name="fmd_logo" accept="image/png,image/jpeg,image/webp,image/gif,application/pdf">
				</label>
			</div>

			<div class="form__design" data-design-box hidden>
				<div class="form__design-head">
					<span class="field__label">Design from the 3D studio</span>
					<button type="button" class="ctl__link" data-design-remove>Remove</button>
				</div>
				<p class="form__design-text mono" data-design-text></p>
				<textarea name="fmd_design" id="fmd_design" hidden data-design-field></textarea>
			</div>

			<label class="field">
				<span class="field__label">Anything else <em>optional</em></span>
				<textarea class="field__input field__input--area" id="fmd_message" name="fmd_message" rows="4"></textarea>
			</label>

			<div class="form__foot">
				<button type="submit" class="btn btn--accent btn--wide" data-submit>Send booking request</button>
				<p class="form__status" role="status" aria-live="polite" data-status>
					<?php
					if ( 'sent' === $fmd_status ) {
						esc_html_e( 'Request sent. We will get back to you shortly.', 'fmd' );
					} elseif ( 'error' === $fmd_status ) {
						esc_html_e( 'The request did not go through. Check your name and email and send it again.', 'fmd' );
					}
					?>
				</p>
			</div>
		</form>
	</div>
</section>
