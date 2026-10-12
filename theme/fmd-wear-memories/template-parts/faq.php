<?php
/**
 * Questions.
 *
 * @package fmd
 */

$fmd_faq = array(
	array( 'How long does printing take?', 'Minutes. Most orders are ready while you wait at the tent.' ),
	array( 'What does it cost a tournament director?', 'Nothing. There is no fee to host us and no minimum order.' ),
	array( 'Can we use our team or club logo?', 'Yes. Attach it to your booking request or bring the file to the tent. A PNG with a transparent background prints cleanest.' ),
	array( 'Can you print names and numbers?', 'Yes. Add a name and number to the back of any T-shirt, crewneck or hoodie.' ),
	array( 'Where do you set up?', 'We are based in ' . fmd_mod( 'city' ) . '. Send us your tournament location and dates and we will confirm.' ),
);
?>
<section class="sec faq" id="faq" aria-labelledby="faq-title">
	<div class="wrap faq__grid">
		<h2 class="h2" id="faq-title">Questions</h2>
		<div class="faq__list">
			<?php foreach ( $fmd_faq as $fmd_q ) : ?>
				<details class="qa">
					<summary class="qa__q"><span><?php echo esc_html( $fmd_q[0] ); ?></span><span class="qa__icon" aria-hidden="true"></span></summary>
					<p class="qa__a"><?php echo esc_html( $fmd_q[1] ); ?></p>
				</details>
			<?php endforeach; ?>
		</div>
	</div>
</section>
