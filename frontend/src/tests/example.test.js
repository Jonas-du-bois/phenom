import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

// Composant simple pour tester
const SimpleComponent = defineComponent({
  name: 'SimpleComponent',
  props: {
    message: {
      type: String,
      default: 'Hello'
    }
  },
  template: '<div>{{ message }}</div>'
});

describe('Configuration Vitest', () => {
  it('devrait monter un composant Vue', () => {
    const wrapper = mount(SimpleComponent, {
      props: {
        message: 'Test réussi!'
      }
    });
    
    expect(wrapper.text()).toBe('Test réussi!');
  });

  it('devrait utiliser les props par défaut', () => {
    const wrapper = mount(SimpleComponent);
    expect(wrapper.text()).toBe('Hello');
  });
});
