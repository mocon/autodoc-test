// Load generated JSON into variable
var json = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': 'scssComments.json',
        'dataType': 'json',
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

// Slugify text for use in anchor tags
function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
}

// <App /> component
var App = React.createClass({
    getInitialState: function() {
        // Use generated JSON file as state
        return {
            json,
            sections : []
        }
    },
    _getSections: function() {
        var _this = this,
            currentJson = _this.state.json,
            sections = [];

        currentJson.map(function(component) {
            component.tags.map(function(tag) {
                if (tag.tag === 'section' && sections.indexOf(tag.description) < 0) {
                    sections.push(tag.description);
                }
            });
        });
        sections.sort();

        _this.setState({sections: sections});
    },
    componentDidMount: function() {
        var _this = this;

        _this._getSections();
    },
    render: function() {
        return (
            <div>
                <GdsSlideNav sections={this.state.sections} components={this.state.json} />
                <GdsTableOfContents sections={this.state.sections} components={this.state.json} />
                <GdsPageHeader />
                <div className="gds-slide-content">
                    <div className="gds-layout__container">
                        <div className="gds-layout__column--lg-9 gds-layout__column--md-12 -p-h-3">
                            <SearchBar components={this.state.json} />
                            <MainColumn sections={this.state.sections} components={this.state.json} />
                            <Footer />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

// <GdsTableOfContents /> component
var GdsTableOfContents = React.createClass({
    componentDidMount: function() {
        $('body').scrollspy({
            target: '.gds-table-of-contents__fixed-nav',
            offset: 140
        });
    },
    render: function() {
        return (
            <div className="gds-table-of-contents__fixed-nav -pointer-events--none">
                <div className="gds-layout__container">
                    <div className="gds-layout__column--lg-push-9 gds-layout__column--lg-3 gds-layout__hidden-md-down -p-l-3 -pointer-events--auto">
                        <Sidebar sections={this.props.sections} components={this.props.components} />
                    </div>
                </div>
            </div>
        )
    }
});

// <Sidebar /> component
var Sidebar = React.createClass({
    render: function() {
        var sections = this.props.sections,
            components = this.props.components;

        return (
            <nav className="gds-table-of-contents">
                <ul id="sidebar" className="nav nav-stacked">
                    {sections.map(function(section, index) {
                        return (
                            <SidebarSection key={index} section={section} components={components} />
                        )
                    })}
                </ul>
            </nav>
        )
    }
});

// <SidebarSection /> component
var SidebarSection = React.createClass({
    render: function() {
        var section = this.props.section,
            components = this.props.components;

        return (
            <li>
                <a href={`#${slugify(section)}`} className="gds-text--header-xs gds-text--link -ellipsis -block">{section}</a>
                <SidebarSectionItemsList section={section} components={components} />
            </li>
        )
    }
});

// <SidebarSectionItemsList /> component
var SidebarSectionItemsList = React.createClass({
    render: function() {
        var section = this.props.section,
            components = this.props.components,
            sortedComponents = [];

        // Sort components in section
        components.map(function(component) {
            return component.tags.map(function(tag) {
                if (tag.tag === 'section' && tag.description === section) {
                    var parentComponent;

                    return component.tags.map(function(tag) {
                        if (tag.tag === 'parentComponent') {
                            parentComponent = tag.description;

                            return component.tags.map(function(tag) {
                                if (tag.tag === 'name' && tag.description === parentComponent && sortedComponents.indexOf(tag.name) < 0) {
                                    sortedComponents.push(tag.description);
                                }
                            });
                        }
                    });
                }
            });
        });
        sortedComponents.sort();

        return (
            <ul className="nav nav-stacked">
                {sortedComponents.map(function(component, index) {
                    return (
                        <li key={index}>
                            <a className="gds-text--link -ellipsis -block" href={`#${slugify(section)}-${slugify(component)}`}>{component}</a>
                        </li>
                    )
                })}
            </ul>
        )
    }
});

// <SearchBar /> component
var SearchBar = React.createClass({
    componentDidUpdate: function() {
        var _this = this;

        ReactDOM.findDOMNode(_this.refs.searchInput).focus();
    },
    render: function() {
        var searchBarStyle = {marginTop: '3px'};

        return (
            <div className="gds-form-group -m-b-4" style={searchBarStyle}>
                <label className="gds-form-group__label">Search Documentation</label>
                <input ref="searchInput" className="gds-form-group__text-input" type="text" placeholder="Search..." />
            </div>
        )
    }
});

// <MainColumn /> component
var MainColumn = React.createClass({
    render: function() {
        var sections = this.props.sections,
            components = this.props.components;

        return (
            <section>
                {sections.map((section, index) => {
                    return (
                        <MainColumnSection key={index} section={section} components={components} />
                    )
                })}
            </section>
        )
    }
});

// <MainColumnSection /> component
var MainColumnSection = React.createClass({
    render: function() {
        var section = this.props.section,
            components = this.props.components,
            componentsInSection = [],
            componentNamesInSection = [];

        // Grab components in section and their names, then sort the names for display
        components.map(function(component) {
            return component.tags.map(function(tag) {
                if (tag.tag === 'section' && tag.description === section) {
                    return component.tags.map(function(tag) {
                        if (tag.tag === 'name' && componentsInSection.indexOf(tag.name) < 0) {
                            componentsInSection.push(component);
                            componentNamesInSection.push(tag.description);
                        }
                    });
                }
            });
        });
        componentNamesInSection.sort();

        return (
            <article>
                <h1 id={`${slugify(section)}`} className="gds-docs__anchor-target gds-text--header-lg -m-t-6 -m-b-4">{section}</h1>
                <MainColumnSectionItemsList section={section} componentNames={componentNamesInSection} components={componentsInSection} />
            </article>
        )
    }
});

// <MainColumnSectionItemsList /> component
var MainColumnSectionItemsList = React.createClass({
    render: function() {
        var section = this.props.section,
            componentNames = this.props.componentNames,
            components = this.props.components,
            parentComponentsOnly = [];

        componentNames.map(function(name) {
            return components.map(function(component) {
                var parentComponent;

                return component.tags.map(function(tag) {
                    if (tag.tag === 'parentComponent') {
                        parentComponent = tag.description;

                        return component.tags.map(function(tag) {
                            if (tag.tag === 'name' && tag.description === parentComponent && parentComponentsOnly.indexOf(tag.description) < 0) {
                                parentComponentsOnly.push(tag.description);
                            }
                        });
                    }
                });
            });
        });
        parentComponentsOnly.sort();

        return (
            <div className="-m-b-4">
                {componentNames.map(function(componentName, index) {
                    return components.map(function(component) {
                        return component.tags.map(function(tag) {
                            if (tag.tag === 'name' && tag.description === componentNames[index]) {
                                return (
                                    <div className="gds-card gds-card--white gds-card--underlined -p-a-3 -m-b-4">
                                        <MainColumnSectionItem section={section} component={component} />
                                    </div>
                                )
                            }
                        })
                    })
                })}
            </div>
        )
    }
});

// <MainColumnSectionItem /> component
var MainColumnSectionItem = React.createClass({
    componentDidMount: function() {
        Prism.highlightAll();
    },
    render: function() {
        var section = this.props.section,
            component = this.props.component,
            capitalized = {textTransform: capitalized},
            parentComponent,
            headerClass = 'gds-text--header-md',
            isChildComponent = '';

        // Determine if this component is a parentComponent
        component.tags.map(function(tag) {
            if (tag.tag === 'parentComponent') {
                parentComponent = tag.description;

                return component.tags.map(function(tag) {
                    if (tag.tag === 'name') {
                        if (tag.description !== parentComponent) {
                            isChildComponent = 'gds-docs__child-component';
                            headerClass = 'gds-text--header-sm';
                        }
                    }
                });
            }
        });

        return (
            <div className={isChildComponent}>
                {component.tags.map(function(tag, index) {

                    {/* Display component's name */}
                    if (tag.tag === 'name') {
                        return (
                            <div key={index}>
                                <label className="gds-form-group__label -m-t-1 -m-b-0">Name</label>
                                <h3 id={`${slugify(section)}-${slugify(tag.description)}`} className={`${headerClass} gds-text--primary gds-docs__anchor-target -m-b-3`} style={capitalized}>{tag.description}</h3>

                                {/* Display component's description */}
                                <label className="gds-form-group__label -m-a-0">Description</label>
                                <h3 className="gds-text--body-md -m-b-3" style={capitalized}>{component.description}</h3>
                            </div>
                        )
                    }

                    {/* Display component's code sample, syntax highlight it with Prism.js */}
                    if (tag.tag === 'example') {
                        var sampleCode = tag.description.replace(/---]/g, '    '),
                            preStyle = {background: '#fafafa', lineHeight: 1.2, borderRadius: '2px'};

                        return (
                            <div key={index} className="-m-b-3">
                                <label className="gds-form-group__label -m-b-2">{tag.tag}</label>
                                <pre className="-m-a-0" style={preStyle}>
                                    <code className="language-html gds-text--body-sm">
                                        {sampleCode}
                                    </code>
                                </pre>
                            </div>
                        )
                    }

                    {/* Display component's author */}
                    if (tag.tag === 'author') {
                        return (
                            <div key={index}>
                                <label className="gds-form-group__label -m-a-0">{tag.tag}</label>
                                <h3 className="gds-text--body-md">{tag.description}</h3>
                            </div>
                        )
                    }

                })}
            </div>
        )
    }
});

// <GdsSlideNav /> component
var GdsSlideNav = React.createClass({
    componentDidMount: function() {
        // Off-canvas module
        (function($) {
            var element = $('[gg-slide-nav]'),
                html = $('[gg-slide-nav-html]'),
                menuOpen = false;

            function toggleMenu(e) {
                $('#gg-slide-nav-button').toggleClass('gds-page-header__menu--open');

                if (menuOpen) {
                    closeMenu();
                } else {
                    openMenu(e);
                }
            }

            function openMenu(e) {
                e.stopPropagation();
                element.addClass("gds-slide-out");
                html.addClass('hide-overflow');
                menuOpen = true;
            }

            function closeMenu(e) {
                element.removeClass("gds-slide-out");
                html.removeClass('hide-overflow');
                menuOpen = false;
            }

            $('body').on('click', '#gg-slide-nav-button', toggleMenu).on('click','[gg-nav-closer]', closeMenu);

            $('body').on('click', '.gds-slide-nav__list--expanded .gds-slide-nav__link', toggleMenu);
            $('body').on('click', '.gds-slide-nav__link.gds-slide-nav__link--expandable.gds-slide-nav__link--expanded', openMenu);

            // Toggle .gds-slide-nav menu with "a" key
            $(document).keypress(function(e) {
                // If any inputs or textareas are being typed in, disable "a" hotkey for showing .gds-slide-nav menu
                if ($('input[type="text"]:focus').length === 0 && $('input[type="email"]:focus').length === 0 && $('input[type="url"]:focus').length === 0 && $('input[type="password"]:focus').length === 0 && $('textarea:focus').length === 0 && e.which === 97) {
                    toggleMenu(e);
                }
            });

            // Hide .gds-slide-nav menu with esc
            $(document).on('keydown', function(e) {
                if (menuOpen && $('input[type="text"]:focus').length === 0 && $('input[type="email"]:focus').length === 0 && $('input[type="url"]:focus').length === 0 && $('input[type="password"]:focus').length === 0 && $('textarea:focus').length === 0 && e.which == 27) {
                    toggleMenu();
                }
            });
        }(jQuery));

        // Mobile-nav module
        (function($) {
            $('body').on('click', '.gg-expandable', function(e) {
                e.stopPropagation();

                var ea = 'gds-slide-nav__link--expanded',
                    el = 'gds-slide-nav__list--expanded';

                if ($(this).hasClass(ea)) {
                    $(this).parent().removeClass(el).children('.gg-expand-list').removeClass(el).parent().find('a').first().removeClass(ea);
                } else {
                    $(this).parent().siblings().removeClass(el).find('.gg-expand-list').removeClass(el).parent().find('a').removeClass(ea);
                    $(this).parent().addClass(el).children('.gg-expand-list').addClass(el).parent().find('a').first().addClass(ea);
                }
                return false;
            });
        }(jQuery));
    },
    render: function() {
        var sections = this.props.sections,
            components = this.props.components;

        return (
            <nav className="gds-slide-nav">
                <div className="gds-slide-nav__group">
                    <label className='gds-slide-nav__label'>Main Menu</label>
                    <ul className="gds-slide-nav__list">
                        {sections.map(function(section, index) {
                            return (
                                <GdsSlideNavSection key={index} section={section} components={components} />
                            )
                        })}
                    </ul>
                </div>
            </nav>
        )
    }
});

// <GdsSlideNavSection /> component
var GdsSlideNavSection = React.createClass({
    render: function() {
        var section = this.props.section,
            components = this.props.components;

        return (
            <li className="gds-slide-nav__list-item gds-slide-nav__list-item--primary gds-slide-nav__list-item--has-children">
                <a className="gds-slide-nav__link gds-slide-nav__link--expandable gg-expandable" href="#">{section}</a>
                <GdsSlideNavSectionList section={section} components={components} />
            </li>
        )
    }
});

// <GdsSlideNavSectionList /> component
var GdsSlideNavSectionList = React.createClass({
    render: function() {
        var section = this.props.section,
            components = this.props.components,
            sortedComponents = [];

        // Sort components in section
        components.map(function(component) {
            return component.tags.map(function(tag) {
                if (tag.tag === 'section' && tag.description === section) {
                    var parentComponent;

                    return component.tags.map(function(tag) {
                        if (tag.tag === 'parentComponent') {
                            parentComponent = tag.description;

                            return component.tags.map(function(tag) {
                                if (tag.tag === 'name' && tag.description === parentComponent && sortedComponents.indexOf(tag.name) < 0) {
                                    sortedComponents.push(tag.description);
                                }
                            });
                        }
                    });
                }
            });
        });
        sortedComponents.sort();

        return (
            <ul className="gds-slide-nav__list gds-slide-nav__list--nested gg-expand-list">
                {sortedComponents.map(function(component, index) {
                    return (
                        <li key={index}><a href={`#${slugify(section)}-${slugify(component)}`} className="gds-slide-nav__link">{component}</a></li>
                    )
                })}
            </ul>
        )
    }
});

// <GdsPageHeader /> component
var GdsPageHeader = React.createClass({
    componentDidMount: function() {
        $(window).bind('scroll', function() {
            if ($(window).scrollTop() >= 5) {
                $('.gds-page-header__product-bar').addClass('gds-page-header__product-bar--collapsed');
                $('.gds-table-of-contents__fixed-nav').addClass('gds-table-of-contents__fixed-nav--scrolled');
            }
            else {
                $('.gds-page-header__product-bar').removeClass('gds-page-header__product-bar--collapsed');
                $('.gds-table-of-contents__fixed-nav').removeClass('gds-table-of-contents__fixed-nav--scrolled');
            }
        });
    },
    render: function() {
        return (
            <header className="gds-page-header">
                <div className="gds-page-header__product-bar">
                    <h6 className="gds-page-header__product-name">Product Name</h6>
                    <img className="gds-page-header__logo" src="https://ds.gumgum.com/images/svg/logo-white.svg" />
                </div>
                <div className="gds-page-header__nav-bar">
                    <div className="gds-page-header__primary-nav" id="gg-slide-nav-button">
                        <button className="gds-page-header__menu">
                            <span className="gds-page-header__menu-line"></span>
                            <span className="gds-page-header__menu-line"></span>
                            <span className="gds-page-header__menu-line"></span>
                            <span className="gds-page-header__menu-line"></span>
                        </button>
                        <h4 className="gds-page-header__page-name gds-text__header--small">Documentation</h4>
                    </div>
                    <div className="-clear-both"></div>
                </div>
            </header>
        )
    }
});

// <Footer /> component
var Footer = React.createClass({
    render: function() {
        var currentYear = new Date().getFullYear(),
            copyrightStyle = {opacity: 0.54};

        return (
            <p className="gds-text--body-sm -m-v-6" style={copyrightStyle}>&copy; Copyright {currentYear} GumGum, All Rights Reserved</p>
        )
    }
});

// Render <App /> to the DOM
ReactDOM.render(<App />, document.querySelector('[data-ui-role="content"]'));
