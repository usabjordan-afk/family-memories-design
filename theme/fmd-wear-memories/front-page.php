<?php
/**
 * One-page front end.
 *
 * @package fmd
 */

get_header();

foreach ( array( 'hero', 'studio', 'designs', 'process', 'pricing', 'directors', 'booth', 'book', 'faq' ) as $fmd_part ) {
	get_template_part( 'template-parts/' . $fmd_part );
}

get_footer();
